const express = require("express");
const Worker = require("../models/Worker");
const auth = require("../middleware/auth");
const router = express.Router();

// GET /api/workers
router.get("/", async (req, res) => {

  try {
    const {q, state,  occupation, available, page = 1, limit = 20 } = req.query;
    const filter = { role: "worker"};
    if (q) {
      filter.$or = [
        { name: new RegExp(q, "i") },
        { occupation: new RegExp(q, "i") },
        { occupationOther: new RegExp(q, "i") },
        { address: new RegExp(q, "i") }
      ];

    }

    if (state)
     filter.state =  new RegExp(state, "i");

    if (occupation)
      filter.occupation = new RegExp(occupation, "i");

    if (available !== undefined)
      filter.available = available === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [workers, total] = await Promise.all([
      Worker.find(filter).select(  "-aadhaar -pan").skip(skip).limit(parseInt(limit)).sort({
        rating: -1
      }),

      Worker.countDocuments(filter)
    ]);
    res.json({ workers,  total, page: parseInt(page), totalPages: Math.ceil( total / parseInt(limit))
    });
  }
  catch {
    res.status(500).json({error:"Server error."});
  }

});



// GET nearby workers

router.get("/nearby",async(req,res)=>{
try{
const{lat,lng,radius=2000,occupation}=req.query;
if(!lat||!lng){
return res.status(400).json({error:"lat and lng required"});
}

const filter={role:"worker","location.coordinates":{$ne:[0,0]},

location:{$nearSphere:{$geometry:{type:"Point",coordinates:[parseFloat(lng),parseFloat(lat)]},
$maxDistance:parseInt(radius)
}
}
};

if(occupation){
filter.occupation=new RegExp(occupation,"i");
}
const workers=await Worker.find(filter).select("-aadhaar -pan").limit(50);
res.json({workers,total:workers.length});
}catch{
  res.status(500).json({error:"Server error"});
}
});

// GET own profile

router.get("/me/profile",auth,async(req,res)=>{
try{
const worker=await Worker.findById(req.worker.id);
if(!worker){
return res.status(404).json({error:"User not found"});
}
res.json(worker);
}catch{

res.status(500).json({error:"Server error"});
}

});

// GET worker by registration ID
router.get("/:id",async(req,res)=>{
try{
const worker=await Worker.findOne({registrationId:req.params.id}).select("-aadhaar -pan");
if(!worker){
return res.status(404).json({
error:"Worker not found"});

}
res.json(worker);
}catch{
res.status(500).json({error:"Server error"});
}

});

// UPDATE worker profile

router.patch("/me",auth,async(req,res)=>{
try{
const allowed=["address","mobile","email","state","priceCharge","available","profilePhoto","location"];
const updates={};
for(
  const key of allowed){
if(req.body[key]!==undefined){

updates[key]=req.body[key];
}

}

if(updates.location){
updates.locationUpdatedAt=new Date();
}

const worker=await Worker.findByIdAndUpdate(req.worker.id,updates,{new:true});
res.json(worker);
}catch{
res.status(500).json({error:"Server error"});
}

});

module.exports=router;