import { Client } from "@notionhq/client";
import fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_KEY });

const Db_dailyTracker = process.env.NOTION_DATABASE_ID_DAILYTRACKER;
const Db_calendar = process.env.NOTION_DATABASE_ID_CALENDAR;

var databaseId = Db_dailyTracker;

var dateText;

const now = new Date();
var tmpdate = new Date();

try{
    dateText = fs.readFileSync("./lastQueryDate.txt", 'utf-8');
} catch (err){
    console.error(err);
}


var date = new Date(dateText);
tmpdate.setDate(now.getDate()+1);

async function addItem_DailyTracker( item ) {
  try {
    const frequency = item.properties.Frequency.select.name;
      if(frequency == "Daily"){
          tmpdate.setDate(now.getDate()+1);
      }else if(frequency == "Every Other Day"){
          tmpdate.setDate(now.getDate()+2);
      }else if(frequency == "Weekly"){
          tmpdate.setDate(now.getDate()+7);
      }
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: { 
          title:[
            {
              "text": {
                "content": item.properties.Name.title[0].plain_text, 
              }
            }
          ]
        },
        Frequency: {
            select: {
              name: item.properties.Frequency.select.name,
              color: item.properties.Frequency.select.color
            }
        },
          Done: {
            checkbox: false
          },
          "Date": {
              date: {
                start: tmpdate.toISOString().substr(0,10)
              }
          }
      },
    })
    console.log(response)
    console.log("Success! Entry added.")
  } catch (error) {
    console.error(error.body)
  }
}


async function retrieveItems(){
    try{
        const response = await notion.databases.retrieve({ database_id: databaseId });
        console.log(response);
    }catch (error){
        console.error(error.body);
    }
}

async function databaseQuery(filter, sort){
    try{
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: filter,
            sort: sort
        });
        const results = response.results;
        // for(var i=0; i < results.length; ++i){
            // // console.log(results[i].properties.Name.title);
            // console.log(results[i].properties.Name.title[0].plain_text);
            // console.log(results[i].properties.Done);
            // console.log(results[i]);
        // }
        return results;
    } catch (error){
        console.error(error.body);
    }
}

const filter = {
    and: [
        {
            property: 'Done',
            checkbox: {
                equals: true,
            },
        },
        {
            property: 'Frequency',
            select: {
                equals: 'Daily',
            },
        },
        
    ],
}

var results = await databaseQuery(filter);

function showResult(results){
    for(var i=0; i < results.length; ++i){
        console.log(results[i].last_edited_time);
        console.log(results[i]);
        console.log(results[i].properties.Frequency.select.name);
        console.log(results[i]);
    }
}

function filterResultWithLocalDate(results){
    var newResults = new Array();
    for(var i=0; i<results.length; ++i){
        console.log(results[i].last_edited_time);
        if( new Date(results[i].last_edited_time ) >= date ){
           newResults.push(results[i]); 
        }
    }
    return newResults;
}

results = filterResultWithLocalDate(results);

showResult(results);

for(var i=0; i<results.length; ++i){
    addItem_DailyTracker(results[i]);
}


date = new Date();

fs.writeFile('./lastQueryDate.txt', date.toString(), err => {
    if( err ){
        console.error(err);
        return;
    }
})

