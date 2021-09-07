import { Client } from "@notionhq/client";
import { databaseQuery } from "./NotionUtil.js"
import fs from 'fs';

const notion = new Client({ auth: process.env.NOTION_KEY });

const Db_dailyTracker = process.env.NOTION_DATABASE_ID_DAILYTRACKER;

var databaseId = Db_dailyTracker;

var dateText;

const now = new Date();
console.log( now.toISOString() + " \n**********************" );

// *********************************************

async function addItem_DailyTracker( item ) {
  try {
    var tmpdate = new Date(item.last_edited_time);
    const frequency = item.properties.Frequency.select.name;
    if(frequency == "Daily"){
        tmpdate.setDate(tmpdate.getDate()+1);
    }else if(frequency == "Every Other Day"){
        tmpdate.setDate(tmpdate.getDate()+2);
    }else if(frequency == "Weekly"){
        tmpdate.setDate(tmpdate.getDate()+7);
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

const filter = {
    and: [
        {
            property: 'Done',
            checkbox: {
                equals: true,
            },
        },
    ],
}

function showResult (results){
    for(var i=0; i < results.length; ++i){
        console.log(results[i]);
    }
    if ( results.length <= 0 ){
        console.log( "No Updates." );
    }
}


function filterResultWithLocalDate(results){
    var newResults = new Array();
    for(var i=0; i<results.length; ++i){
        if( new Date(results[i].last_edited_time ) >= date ){
           newResults.push(results[i]); 
        }
    }
    return newResults;
}


// *********************************************

// read date of last update
try{
    dateText = fs.readFileSync("./lastQueryDate.txt", 'utf-8');
} catch (err){
    console.error(err);
}

// parse dateText
var date = new Date(dateText);

// query notion database 
var results = await databaseQuery(databaseId, filter);

// filter results with local Date
results = filterResultWithLocalDate(results);

// for debug
showResult(results);

// add items
for(var i=0; i<results.length; ++i){
    await addItem_DailyTracker(results[i]);
}

// write date of this update
date = new Date();

fs.writeFile('./lastQueryDate.txt', date.toString(), err => {
    if( err ){
        console.error(err);
        console.log( "End ... \n\n" )
        return;
    }
})

console.log( "End ... \n\n" )
