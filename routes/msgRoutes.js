const msgModel = require("../models/msg.js");
const {Router} = require("express");
const userModel = require("../models/user.js")

const route = Router();

route.get("/all/chats", async (req,res) => {
    const {errorMsg} = req.query;

   const users = await userModel.find({});
    res.render("msg-history.ejs" , {users , currUser:req.user , errorMsg});

});


    route.get("/view/chat/:id",async(req,res) => {   // :id -> other user
           const otherUserId = req.params.id;
           
           const allMessages = await msgModel.find({
            $or: [
              { from: req.user._id , to:otherUserId},
              { to: req.user._id , from:otherUserId }
            ]
          }).sort({ createdAt: 1 });

          const otherUser = await userModel.findById(otherUserId);
          // console.log(allMessages);

          const {errorMsg} = req.query;

          res.render("view-indi-user-message.ejs" , {allMessages , user:req.user._id , otherUser , errorMsg});
    });

    route.post("/send-msg" , async (req,res) => {
      const {otherUser , errorMsg} = req.query;
      const {message} = req.body;
     // console.log(otherUser._id);

      await msgModel.create({
        from:req.user._id , 
        to:otherUser , 
        message : message
      });
         
      return res.redirect(`/messages/view/chat/${otherUser}?errroMsg=${errorMsg}`);
    });

module.exports = route;