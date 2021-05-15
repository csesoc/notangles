from bs4 import BeautifulSoup
import json
import requests
import re

BASEURL = "http://timetable.unsw.edu.au/2020/COMP1511.html"

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

data = requests.get(BASEURL)
data = data.text

soup = BeautifulSoup(data, 'html.parser')

getClassLinks(soup)