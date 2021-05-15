#!/usr/bin/env python3

from bs4 import BeautifulSoup
from concurrent.futures import as_completed
from requests_futures.sessions import FuturesSession
import re
import requests
import json
import datetime
import os
import sys
import pymongo

keys = ["DEV", "STAGING", "PROD"]
env = ""
for key in keys:
    if os.getenv(key) != None:
        env = key
if env == "":
    print("Error: No environment specified. Please use 'DEV', 'STAGING' or 'PROD'", file=sys.stderr)
    exit(1)
else:
    print(f"Set environment to {env}", file=sys.stderr)

env_config = {"DEV":{"database":"mongodb://database:27017/","scraper":"mongodb://localhost:27017"},"STAGING":{"database":"secret.staging","scraper":"mongodb://localhost:27017"},"PROD":{"database":"secret.prod","scraper":"mongodb://localhost:27017"}}
database = env_config[env]["database"]
scraper = env_config[env]["scraper"]

BASE_URL = "http://timetable.unsw.edu.au/2020/"

def remove_html_specials(text):
    newstr = text.replace('&amp;', 'and')
    newstr = newstr.replace('&nbsp', '')
    newstr = newstr.replace('&lt;', '<')
    newstr = newstr.replace('&gt;', '>')

    return newstr

def scrape_table(soup, url, fields):

    # Initialisation
    campuses = []
    refined_data = {}

    # Find all Campus Headings
    minor_headings = soup.find_all('td', {'class': 'classSearchMinorHeading'})

    # For each heading, filter out false-positives and store element in `campuses`
    for heading in minor_headings:
        campus = heading.get_text()
        if campus != '':
            campuses.append(heading)

    # Find subject area for each campus
    for campus in campuses:
        # Find the table containing subject data relative to the campus heading
        parent_table = campus.parent.find_next('tr')
        heading = parent_table.find('td', {'class' : 'tableHeading'})

        # Get all table entries containing subject data and store into `entries`
        low = heading.parent.parent.find_all('tr', {'class' : 'rowLowlight'})
        high = heading.parent.parent.find_all('tr', {'class' : 'rowHighlight'})
        entries = low + high

        # Construct refined data and store in list relative to campus name in `refinedData`
        campus_title = campus.getText().strip()
        refined_data[campus_title] = []

        for entry in entries:
            row_data = {}
            cells = entry.find_all('td', {'class' : 'data'})

            # Ensure data is in correct format
            if len(cells) != 3:
                continue

            # Store data in relevant locations
            for i in range(len(fields)):
                row_data[fields[i]] = cells[i].get_text()
            row_data['link'] = BASE_URL + cells[0].find('a')['href']

            # Add row data to collected data
            refined_data[campus_title].append(row_data)

    return refined_data

def get_campus_and_subject_areas(soup):
    return scrape_table(soup, BASE_URL, ["code", "subjectArea", "school"])

def scrape_faculty(soup, refined_data):
    key_list = refined_data.keys()
    i = 0
    j = 0
    for campus in key_list:
        j += 1
        faculty_reqs = "temp"
        with FuturesSession(max_workers=10) as session:
            faculty_reqs = [session.get(faculty['link']) for faculty in refined_data[campus]]
            faculty_res = [res.result() for res in as_completed(faculty_reqs)]
            faculty_res = [res.content for res in faculty_res]
        for faculty_index in range(len(refined_data[campus])):
            i += 1
            faculty = refined_data[campus][faculty_index]
            faculty_data = faculty_res[faculty_index]
            faculty_soup = BeautifulSoup(faculty_data, 'html.parser')
            scraped_faculty = scrape_table(faculty_soup, faculty['link'], ["code", "name", "uoc"])
            for field in scraped_faculty.keys():
                refined_data[campus][faculty_index][field.lower()] = scraped_faculty[field]
    print(f"Scraped {i} faculties in {j} campuses")
    return refined_data

def getTimetable(soup, this_class):
    timetable = {}
    rows = soup.find_all('tr')
    classList = []
    keys = []
    for i in range(0, len(rows)):
        classOffering = []
        children = rows[i].findChildren()
        if len(children) > 1:
            for child in children:
                classOffering.append(child.getText())
        
            classList.append(classOffering)

    return classList

def getClassLinks(soup):
    summary_tables = []
    anchorTags = []
    terms = {}
    minor_headings = soup.find_all('td', {'class': 'classSearchSectionHeading'})
    for heading in minor_headings:
        section = heading.getText()
        if re.search("SUMMARY OF", section):
            summary_tables.append(heading)

    # get the anchor tag labels for each class
    for summary_table in summary_tables:
        parent_table = summary_table.parent.findNext('table')
        term_summaries = parent_table.find_all('td', {'class': 'formBody'})
        for term_summary in term_summaries:
            low = term_summary.find_all('tr', {'class' : 'rowLowlight'})
            high = term_summary.find_all('tr', {'class' : 'rowHighlight'})
            entries = low + high

            for entry in entries:
                cells = entry.find_all('td', {'class' : 'data'})
                anchorTags.append((cells[0].find('a')['href']).replace('#', ''))

    # get the class data
    classesHTML = []
    for anchor in anchorTags:
        class_table = soup.find('a', {'name': anchor})
        class_table = class_table.parent.parent.parent
        classRows = class_table.find_all('tr')
    
        this_class = {}
        for row in classRows:
            labels = row.find_all('td', {'class' : 'label'})
            
            for label in labels:
                sibling = label.find_next_sibling()
                if sibling:
                    label = label.getText()
                    sibling = sibling.getText()
                    this_class[label] = sibling
                          
            timetable = row.find('td', {'class': 'formBody'})
            if timetable:
                tables = []
                table = getTimetable(timetable, this_class)
                if len(table) > 1:
                    times = {}
                    for i in range(1, len(table)):
                        for j in range(len(table[i])):
                            times[table[0][j]] = table[i][j]

                        if times:
                            tables.append(times)

                    if tables:
                        this_class['Time Table'] = tables

        if this_class:
            if this_class['Teaching Period'] not in terms:
                terms[this_class['Teaching Period']] = []
            terms[this_class['Teaching Period']].append(this_class)
    
    return terms

def getClasses(course_data):
    classLinks = []

    for campus in course_data.keys():
        for faculty in course_data[campus]:
            try:
                for course in faculty["undergraduate"]:
                    classLinks.append(course["link"])
            except KeyError:
                a = 0
            try:
                for course in faculty["postgraduate"]:
                    classLinks.append(course["link"])
            except KeyError:
                a = 1
    return classLinks

def batchProcessClasses(classLinks):
    classes = []
    with FuturesSession(max_workers=20) as session:
        req_list = [session.get(link) for link in classLinks]
        ok = 0
        other = 0
        i = 0
        for future in [res.result() for res in as_completed(req_list)]:
            res = future
            i += 1
            if res != None and res.status_code == 200:
                soup = BeautifulSoup(res._content.decode(), 'html.parser')
                classes.append(getClassLinks(soup))
    print(f"Processed {i} courses", file=sys.stderr)
    return classes

data = requests.get(BASE_URL)
data = data.text

soup = BeautifulSoup(data, 'html.parser')

#print(scrape_faculty(soup, get_campus_and_subject_areas(soup)))
if __name__ == "__main__":
    #print(json.dumps(scrape_faculty(soup, get_campus_and_subject_areas(soup))))
    print(json.dumps(batchProcessClasses(getClasses(scrape_faculty(soup, get_campus_and_subject_areas(soup))))))
else:
    courseData = json.dumps(scrape_faculty(soup, get_campus_and_subject_areas(soup)))
