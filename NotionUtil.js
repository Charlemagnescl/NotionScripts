import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_KEY });

async function databaseQuery( databaseId, filter, sort ){
    try{
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: filter,
            sort: sort
        });
        const results = response.results;
        return results;
    } catch (error){
        console.error(error.body);
    }
}

export  {
    databaseQuery,
}
