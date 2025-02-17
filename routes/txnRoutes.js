const {Router} = require("express");
const txnModel = require("../models/txn.js");
const userModel = require("../models/user.js");
const requestModel = require("../models/requestModel.js");
const {createHmac} = require("crypto");
const { console } = require("inspector");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");


const route = Router();


route.get("/change-pin", (req,res) => {
  const errorMsg = req.query.errorMsg;
  // console.log("Hello    ",req.query.errorMsg);
  res.render("change-pin.ejs",{errorMsg,user:req.user});
});


route.post("/change-pin", async (req,res) => {
  const {email,aadhar,dob,mobile,pin,full_name,errorMsg} = req.body;
  const user = await userModel.findOne({email});

  if(!user || user.aadhar != aadhar || user.dob != dob || user.mobile != mobile || user.full_name != full_name)
  {
      let error = "Invalid Credentials...";
      return res.redirect(`/transactions/change-pin?errorMsg=${error}`);
  }

  return res.redirect(`/user/generate-otp?email=${email}&mobile=${mobile}&full_name=${full_name}&aadhar=${aadhar}&dob=${dob}&pin=${pin}&errorMsg=${errorMsg}`);
});



route.get("/history/:id" , async(req,res) => {
      
  // const txns = await txnModel.find({
  //   $or: [
  //     { $and: [{ to: req.params.id }, { from: req.user?._id }] },
  //     { $and: [{ from: req.user?._id }, { to: req.params.id }] }
  //   ]
  // })
  // .populate("from")
  // .populate("to");

  // console.log("showw")

  // console.log(txns);

  const userId = req.user._id.toString();
  const otherUserId = req.params.id.toString();

  console.log("🔹 Logged-in User ID:", userId);
  console.log("🔹 Viewing Transactions with User ID:", otherUserId);

  const txns = await txnModel
    .find({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId }
      ]
    })
    .populate("from")
    .populate("to")
    .sort({ createdAt: 1 });

  res.render("indi-txn.ejs", {txns,user:req.user})
});


route.get("/view/all",async (req,res) => {
  const {errorMsg} = req.query;
  // console.log("CHECKING");
    
  const txns = await txnModel.find({
    $or: [
      {from: req.user._id},
      {to: req.user._id }
    ]
  }).populate("from")
  .populate("to")
  .sort({ createdAt: -1 });

       res.render("txn-history.ejs", {txns , senderId : req.user._id , errorMsg});

});

  route.get("/send-money" , async (req,res) => {
     const User = await userModel.findById(req.user?._id);
     if(!User)
     {
      let error = "Login";
      return res.redirect(`/user/login?errorMsg=${error}`)
     }
     const {othersrequestId , errorMsg} = req.query;
    // console.log(othersrequestId);
     const othersRequest = othersrequestId ? await requestModel.findById(othersrequestId) : null;
    const rec = othersRequest ? await userModel.findById(othersRequest.from) : null;
    res.render("send-txn",{user:User , othersRequest , rec , errorMsg});
  });


route.post("/send-money",async (req,res) => {

     const {amount , pin, toMobile , remarks} = req.body;
     const {othersrequestId} = req.query;
      // let othersUserId = await userModel.findOne({mobile:toMobile});

     if(!amount || !pin || !toMobile)
     {
        console.log("All fields are required for sending amount");
       // let othersrequestId = await userModel.findOne({mobile:toMobile});
        let errorMsg = "All fields are required for sending amount";
        return res.redirect(`/transactions/send-money?errorMsg=${errorMsg}&othersrequestId=${othersrequestId}`);
     }

     const sender = await userModel.findById(req.user?._id);
     const receiver = await userModel.findOne({mobile:toMobile});

     if(!receiver)
     {
      console.log("Invalid Receiver");
      let errorMsg = "No such receiver exists";
      return res.redirect(`/transactions/send-money?errorMsg=${errorMsg}&othersrequestId=${othersrequestId}`);
     }
    //  console.log(sender._id);
    //  console.log(receiver._id);

     if(req.user._id == receiver._id)
      {
       console.log("You are Trying to send money to same acount");
       let errorMsg="You are Trying to send money to same acount";
       return res.redirect(`/transactions/send-money?errorMsg=${errorMsg}&othersrequestId=${othersrequestId}`);
      }

     if(sender.money < amount)
     {
        console.log("Transaction Failed Due to Insufficient Money In Wallet");
        let errorMsg = "Transaction Failed Due to Insufficient Money In Wallet";
        return res.redirect(`/transactions/send-money?errorMsg=${errorMsg}&othersrequestId=${othersrequestId}`);
     }

     if(amount == 0)
      {
        //  console.log("Transaction Failed Due to Insufficient Money In Wallet");
         let errorMsg = "Invalid Amount";
         return res.redirect(`/transactions/send-money?errorMsg=${errorMsg}&othersrequestId=${othersrequestId}`);
      }



     const salt = sender.salt;

         const userGivenHashedPin = createHmac("sha256",salt)
         .update(pin)
         .digest("hex");

     if(userGivenHashedPin != sender.pin)
     {
        console.log("Transaction Failed Due to Incorrect Pin");
        let errorMsg = "Transaction Failed Due to Incorrect Pin";
        return res.redirect(`/transactions/send-money?errorMsg=${errorMsg}&othersrequestId=${othersrequestId}`);
     }

     

    await txnModel.create({
         from : sender._id , 
         to : receiver._id , 
         amount : amount ,
         remarks : remarks
     });

      sender.money -= amount;
      receiver.money += parseFloat(amount);

     await userModel.findByIdAndUpdate(sender._id , {$set : {money : sender.money }});

     await userModel.findByIdAndUpdate(receiver._id , {$set : {money : receiver.money }});

     othersrequestId ? await requestModel.findByIdAndUpdate(othersrequestId , {pendingStatus : 1}) : '';

        console.log("Successfully send.....");
       const transporter = nodemailer.createTransport({
                 service: 'gmail', 
                 auth: {
                     user: 'testapplication2710@gmail.com', // Your email
                     pass: 'pagj zphv xcho bsiu'   
                 }
             });
         
             const mailOptions = {
                 from: 'testapplication2710@gmail.com',
                 to: sender.email,
                 subject: 'Money Send ',
                 text: `You have recently sent Rs. ${amount} to ${receiver.full_name} , (${receiver.mobile}) . Your current balance is : ${sender.money}`
             };
         
             try {
                 await transporter.sendMail(mailOptions);
                // console.log("OTP sent successfully");
                //  res.json({ message: `OTP sent to ${email}` });
             } catch (error) {
                // console.error("OTP send failed", error);
                // res.status(500).json({ error: "Failed to send OTP" });
             }

     let errorMsg = "Successfully Send Transaction";
     return res.redirect(`/transactions/send-money?errorMsg=${errorMsg}`);
      
});


route.get("/othersrequest" , async(req,res) => {
    // const requests = await requestModel.find({to : req.user._id}).sort;
    const {errorMsg} = req.query;


    const requests = await requestModel.aggregate([
      {
          $match: {
              $or: [
                  { to: new mongoose.Types.ObjectId(req.user._id) },
                  { from: new mongoose.Types.ObjectId(req.user._id) }
              ]
          }
      },
      {
          $addFields: {
              priority: { $cond: { if: { $eq: ["$pendingStatus", 0] }, then: 1, else: 0 } }
          }
      },
      {
          $sort: { priority: -1, createdAt: -1 }
      },
      // Populate "from" field
      {
          $lookup: {
              from: "users", // Name of the users collection
              localField: "from",
              foreignField: "_id",
              as: "from"
          }
      },
      { $unwind: "$from" }, // Convert array to object (if needed)
      
      // Populate "to" field
      {
          $lookup: {
              from: "users",
              localField: "to",
              foreignField: "_id",
              as: "to"
          }
      },
      { $unwind: "$to" } // Convert array to object (if needed)
  ]);
  
  console.log(requests);
  



  //   const requests = await requestModel.aggregate([
  //     {
  //         $match: {
  //             $or: [
  //                 { to: req.user._Id },
  //                 { from: req.user._Id }
  //             ]
  //         }
  //     },
  //     {
  //         $addFields: {
  //             priority: { $cond: { if: { $eq: ["$pendingStatus", 0] }, then: 1, else: 0 } }
  //         }
  //     },
  //     {
  //         $sort: { priority: -1, createdAt: -1 }
  //     }
  // ]) 
  //     .populate("from")
  //    .populate("to");


    //  const requests = await requestModel.find({
    //    $or:[
    //     {to : req.user._id} ,
    //     {from : req.user._id}
    //    ]
    //  })
    //   .populate("from")
    //   .populate("to")
    //     .sort({pendingStatus : 1})
    //     .exec();
    console.log(requests);

         res.render("othersrequest.ejs" , {requests , user : req.user , errorMsg});
});


route.post("/othersrequest" , async (req,res) => {
     const {requestStatusId , verified} = req.body;
    //  console.log("Checking");
     if(!requestStatusId)
     {
      console.log("Fields are needed for sending request");
      let errorMsg = "Fields are needed for sending request";
     return res.redirect(`/user/?errorMsg=${errorMsg}`);
     }

     if(verified === "reject")
     {
          let msg = "You rejected request of money";
         await requestModel.findByIdAndUpdate(requestStatusId ,{pendingStatus : 2});
         return res.redirect(`/transactions/othersrequest?errorMsg:${msg}`);
     } 


     console.log("You approved the payment");

      
   //  console.log("DELETED  ");
     return res.redirect(`/transactions/send-money?othersrequestId=${requestStatusId}`);

});


 route.get("/request-money", async (req,res) => {
      const User = await userModel.findById(req.user._id);
      const {errorMsg} = req.query;
      console.log(errorMsg);
      res.render("receive-money-Page.ejs" , {user:User , errorMsg});
 });

 route.post("/request-money", async(req,res) => {
    const {amount , mobile , remarks} = req.body;

    if(!amount || !mobile)
    {
      console.log("Credentials are required for requesting money");
      let errorMsg = "Credentials are required for requesting money";
       return res.redirect(`/transactions/request-money?errorMsg=${errorMsg}`);
    }

    const requestReceiver = await userModel.findOne({mobile : mobile});

    if(!requestReceiver)
      {
        console.log("User does not exist");
        let errorMsg = "User does not exist";
        return res.redirect(`/transactions/request-money?errorMsg=${errorMsg}`);     
      }

      if(requestReceiver._id == req.user._id)
        {
          console.log("You are trying to request money to yourself");
          let errorMsg = "You are trying to request money to yourself";
          return res.redirect(`/transactions/request-money?errorMsg=${errorMsg}`);             
        }

      requestModel.create({
            from:req.user._id ,
            to : requestReceiver._id ,
            amount : amount ,
            remarks : remarks 
      });


      console.log("Request Sent successfully");
      let errorMsg = "Request Sent successfully";


      return res.redirect(`/transactions/request-money?errorMsg=${errorMsg}`);  
 });



module.exports = route;