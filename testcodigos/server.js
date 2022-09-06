const express = require('express');
var bodyParser = require('body-parser')
const app = express();
require("dotenv").config()
bodyParser = require('body-parser').json();
const axios = require('axios');
var request = require('request');
const moment = require( 'moment-timezone');
const path = require('path');


app.use(express.json());

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/items', function (req, res) {

  let result=[]
  let geojson=[]

  const urlAPIAWS = 'https://rcg9tjimie.execute-api.us-west-2.amazonaws.com/items'

  console.log("start count devices");
      const type="Feature"
  loopProcesssentral(urlAPIAWS, 'items').then(data=> {
   
              data.Items.forEach((data, index) => {
                let data2=data.payload.output.payloadDecoded
                let key_id=data.id
                let date=data.payload.output.received_at
                let device_id=data.payload.output.end_device_ids.device_id
                let longitude=data.payload.output.payloadDecoded.longitude
                let latitude=data.payload.output.payloadDecoded.latitude
                let rssi=data.payload.output.payloadDecoded.rssi
                let snr=data.payload.output.payloadDecoded.snr
                let length=data.payload.output.payloadDecoded.leng_hexmessage
                let fecha=moment.utc(date).format('YYYY-MM-DDTHH:mm');
                

                  if(latitude===null || longitude ===null){
                   
                   
                  }else{
                  result.push({device_id,date,key_id,longitude,latitude,rssi,snr,length})
                  var properties ={
                    "marker-color": "#1cc7ca",
                    "marker-size": "medium",
                    "marker-symbol": "",
                    "iddevice": device_id,
                    "longitude":longitude,
                    "latitude":latitude,
                    "date":fecha,
                    "rssi":rssi,
                    "snr":snr,
                    "length":length
                  }
                  var geometry={
                    "type": "Point",
                    "coordinates": [
                      longitude,
                      latitude
                    ]
                    
                  }
                  geojson.push({type,properties,geometry})
                  }
              
                 
                });
                var jsongeo={
                  type: "FeatureCollection",
                  features:geojson

                }
              res.send({
                //count:data.Count,
                //datadevices:result,
                type: "FeatureCollection",
                features:geojson
              
                      });
          }).catch(err => {
              res.status(500).send(err);
          })
      });

 //////////////////////////INFORMACION DE SIMSCARDS

 async function loopProcesssentral(url, typeProcess) {
  let countPage = 1;
  let result = 0;
  let finished = false;
  let dateresponse
  // start process increasing page number till response status code 400 (empty)
  
  const urlJoin = `${url}`;
  //console.log("urlJoin", urlJoin);
  
      try {
       
          const response = await axios.get(urlJoin)
          const resultProcess = await optionProcesssentral(response, typeProcess, result);
          result = resultProcess
          finished = true;
      } catch (error) {
          //console.log("error (400) for finished", error.response.status);
          // if status code is 400 then finish (not more page)
          if (error.response.status === 400) {
              finished = true;
          }
      }
  //console.log(result)
  return result;
  }
  
  // process data with switch and each case
  async function optionProcesssentral(response, option, resultTmp) {
  
  let result = 0;
  let total=0;
  let totalclose=0;
  let totalopen=0;
  let jsonresult
  var ticketsid= []
  switch (option) {
    case 'items':
      return result=response.data;
      return result;
    case 'ticketsrequerements':
      //console.log(response)
          var ticketsid= []
              response.data.forEach((item) => {
                //console.log(item.state) 
                let id=item.sys_id
                let opened_at=item.opened_at
                let state = item.state
                let closed_at=item.closed_at
                let type ="requerimiento"
                  //console.log(uso.sys_id,tipereque,uso.opened_at,uso.state,uso.closed_at)
                  ticketsid.push({id,type,opened_at,state,closed_at})
                if (item.state=='Terminado' || item.state=='Cancelado' || item.state=='Cerrado' ){totalclose++;}
               if (item.state=='Abierto' || item.state=='Pendiente' || item.state=='En Progreso'){totalopen++;}
               total++;
              });
  
               jsonresult =  {
                totaltickets : total,
                totalticketsclose:totalclose,
                totalticketsopen:totalopen,
                ticketsid: ticketsid
            }
              result = jsonresult;
              //console.log( result)
              return result;
              default:
              break;
    case 'ticketsincidents':
      //console.log(response)
              var ticketsid= []
            response.data.forEach((item) => {
              //console.log(item.state)
              let id=item.number
              let opened_at=item.opened_at
              let state = item.state
              let closed_at=item.closed_at
              let type ="incidencia";
              ticketsid.push({id,type,opened_at,state,closed_at})
              if (item.state=='Terminado' || item.state=='Cancelado' || item.state=='Cerrado' ){totalclose++;}
              if (item.state=='Abierto' || item.state=='Pendiente' || item.state=='En Progreso'){totalopen++;}
              total++;
            });
           jsonresult =  {
                totaltickets : total,
                totalticketsclose:totalclose,
                totalticketsopen:totalopen,
                ticketsid:ticketsid
            }
            result = jsonresult;
            //console.log( result)
            return result;
            break;  
           }  
  return result;
  }
 const PORT = process.env.PORT || 8080;
 
 app.listen(PORT, () => {
 console.log(`Server listening on port ${PORT}...`);
 });