import type  { H3Event } from 'h3';


export default defineEventHandler(async (event) => {
    initSocket(event)

    return  {
        result: 300
    }
  })