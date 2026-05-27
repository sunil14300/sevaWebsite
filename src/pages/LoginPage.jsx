import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const LoginPage=()=>{
const[regId,setRegId]=useState("");
const[dob,setDob]=useState("");
const[showOTP,setShowOTP]=useState(false);
const[otp,setOtp]=useState("");
const[tempRegistrationId,setTempRegistrationId]=useState("");
const[loading,setLoading]=useState(false);
const{login}=useAuth();
const navigate=useNavigate();
const handleSubmit=async(e)=>{e.preventDefault();
setLoading(true);

try{

const data=await api.login(regId,dob);

if(data.adminOTP){
setShowOTP(true);
setTempRegistrationId(data.registrationId);
toast.success("OTP sent to admin email");

setLoading(false);

return;

}

login(data.token,data.user);
toast.success(`Welcome ${data.user?.name||"User"}`);
redirectUser(data.user.role);

}catch(err){
toast.error(err.message||"Login failed");
}

setLoading(false);

};

const verifyOTP=async()=>{
try{
setLoading(true);

const data=await api.verifyAdminOTP(tempRegistrationId,otp);
login(data.token,data.user);
toast.success("Admin verified");
navigate("/admin");

}catch(err){
toast.error(err.message||"OTP verification failed");
}
setLoading(false);
};

const redirectUser=(role)=>{

if(role==="admin"){
navigate("/admin");
return;
}

if(role==="worker"){
  navigate("/dashboard");
return;
}

navigate("/search");
};

return(

<div className="pt-14 min-h-screen flex items-center justify-center">

<div className="form-panel w-full">

<p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">User Portal</p>
<h1 className="text-3xl font-bold tracking-tight mb-8 ">Login</h1>
<form onSubmit={handleSubmit} className="space-y-4">
<div>

<label>Registration ID</label>

<input type="text" value={regId} onChange={(e)=>setRegId(e.target.value)}required className=" w-full h-11 px-4 border"/>
</div>

<div>
<label>Date Of Birth</label>
<input type="date" value={dob} onChange={(e)=>setDob(e.target.value)}required className="w-full h-11 px-4 border"/></div>
{ showOTP&&(

<div>
<label>Admin OTP</label>
<input type="text" value={otp} onChange={(e)=>setOtp(e.target.value)}placeholder="Enter OTP" className="w-full h-11 px-4 border"/></div>
)
}
<div>

{!showOTP? (<button type="submit" disabled={loading}className="w-full h-12 bg-primary text-white">

{loading ?"Logging in..." : "Login"}
</button>):(
<button type="button" onClick={verifyOTP} disabled={loading} className="w-full h-12 bg-primary text-white">
{loading ? "Verifying..." :"Verify OTP"}
</button>

)
}
</div>

<p className=" text-center text-sm">Not registered?
<Link to="/register">Register</Link>
</p>
</form>
</div>
</div>

);

};

export default LoginPage;