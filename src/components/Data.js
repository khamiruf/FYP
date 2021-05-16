import data from './data/algo_parsed_0.json'

const Data = () => {
  var matches_arr = [];


  for (var k in data){
    if (data.hasOwnProperty(k)){
      if (k.startsWith("result")){
        console.log('RESULT');
      }
      else {
        matches_arr.push({
          'key': k,
          'data': data[k],
        })
      }
    }
  }
  console.log(data);
  console.log(matches_arr);



  return (
    <div>
      
    </div>
  )
}

export default Data
