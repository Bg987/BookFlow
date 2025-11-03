const Library = require("../models/Library");
const Username = require("../models/username");
const Librarian = require("../models/Librarian");
const Member = require("../models/member");
const { deleteFromCloudinary } = require("./cloudDelete");

exports.rollBackCommon = async(Uid,role) => {
    try{
        const temp = await Username.find({
            referenceId: Uid,
        })
        //delete if profile pic in case of lirarian and member
        if(temp[0].profilePicUrl) {
            try {
                await deleteFromCloudinary(temp[0].profilePicUrl);
            } catch (cloudErr) {
                console.error("roleback Cloudinary image delete error:", cloudErr.message);}
        }
        await Username.deleteOne({ referenceId: Uid });
        //role based sql insert rollaback
        if (role === "library") {
            await Library.destroy({ where: { lib_id: Uid } });
            return true;
        }
        else if (role === "librarian") {
            await Librarian.destroy({ where: { librarian_id: Uid } });
            return true;
        }
        else if (role === "member") {
            await Member.destroy({ where: { member_id: Uid } });
            return true;
        }
    }
    catch(error) {
        console.log("error in rollback ", error);
        return false;
    }
}