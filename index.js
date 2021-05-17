var axios= require('axios');
var CronJob = require('cron').CronJob;
var count=0;
const telegramChatId=850830218;
let resend='';
//const telegramURL=`https://api.telegram.org/bot1239110605:AAF5dP3utZ3g_jurCxh0a0Lg1Tobkz7Jl28/sendMessage?chat_id=${telegramChatId}&text='hello';`
const telegramURL='https://api.telegram.org/bot1239110605:AAF5dP3utZ3g_jurCxh0a0Lg1Tobkz7Jl28/sendMessage';
const distId=265  //294 bbmp  265 urban
let buffer=[];

const date= new Date();
let inputDate= `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
const url=`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${distId}&date=${inputDate}`;
console.log(inputDate);
let availableCenter=[];
let previousCenters=[];
let initialFetch= true;
//console.log(`initial previous valuie ${previousCenters.length} with initialfetc ${initialFetch}`);

function checkslots(el){
  
    let bucket=[];
    bucket=el.sessions.filter(el2=>(el2.min_age_limit==18 &&  el2.available_capacity>0));
    

    if(bucket.length) {
        
        el.totalAvailableVaccine= bucket.reduce((total,currentVal)=>{
            total=total+currentVal.available_capacity;
            return total;
        },0);
        el.status=1;
        el.sessions=bucket;
	console.log(el.totalAvailableVaccine);
        availableCenter.push(el);
       

    }
 //console.log(el);

 }



const options={
    method: 'get',
    url,
    headers:  {'content-type': 'application/json',
    'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36' }
  };




    function fetchslot(){
        console.log('fetching..')
        count ++;
        axios(options)
    .then(function (response) {
    
        details= response.data.centers;
        //buffer=details;
        details.forEach(checkslots);
       //console.log(availableCenter);
        if( !availableCenter.length) 
        {
            console.log('not available');
        }  else{

                //buffer= availableCenter;
               availableCenter.forEach((el,i)=>{
                 //console.log(`${el.name}`);
                 console.log(`${el.name}-${el.totalAvailableVaccine} no valid`);
                    if(previousCenters.length){
                        let found=previousCenters.find(el2=>el2.center_id===el.center_id && el2.totalAvailableVaccine===el.totalAvailableVaccine);
                        //console.log(`found center ${found.name} ${found.totalAvailableVaccine}`);
                        //console.log(`${el.name}-${el.totalAvailableVaccine} no valid`);
                        if(found) el.status=0

                      

                    }
                    //console.log(el);
                  
                    //
                  
                   let sendText=`At ${el.name}`;
                  if(!!el.status){
                      //console.log(`${el.name}-${el.totalAvailableVaccine}`)
                    console.log(`${el.name} with ${el.totalAvailableVaccine}`);
                      el.sessions.forEach(el2=>{
                        sendText +=`- ${el2.available_capacity} ${el2.vaccine} are available at ${el2.date}`;
                        const telegramOption={
                            method:'get',
                            url:telegramURL,
                            params: {
                            chat_id: telegramChatId,
                            text: sendText
                        }
                    }
                        axios(telegramOption).then((res)=>console.log('done')).catch(err=>console.log(err));
                      }) 
                
            
            }
                  
                
               }) ;
                            
               previousCenters=[];
               previousCenters= [...availableCenter];             
               availableCenter=[];
        } 
        
       
    }).catch(err=>console.log(err));
    }



var job = new CronJob('*/5 * * * * *', async function() {
    //console.log('You will see this message every second');
    console.log('************************');
    await fetchslot();
    console.log('************************');
  });
job.start();




