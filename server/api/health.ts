
export default defineEventHandler(async (_) => {
    const options:any = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: 'numeric', 
        second: 'numeric' 
    };
    
    const formattedDate = new Intl.DateTimeFormat('en-US', options)
        .format(Date.now());
	return {
		result: `Mello is up and running! ${formattedDate}`,
	}
})
