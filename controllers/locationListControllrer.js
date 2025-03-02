require("dotenv").config(); 

const getLocationList = async(req,res)=>{
    const query = req.query.q;
    const access_key = process.env.LOCATION_IQ_ACCESS_TOKEN
    const endPoint = `https://api.locationiq.com/v1/autocomplete?key=${access_key}&q=${query}` 

    const response = await fetch(endPoint)
    const data = await response.json()
    const filteredLocations = data.filter(item=>item.class==="node" || item.class==="suburb" || item.class==="place")
    if(filteredLocations){
        res.json({data:filteredLocations})
        return;
    }
    res.json({msg:"There was no location found"})
}

module.exports = getLocationList