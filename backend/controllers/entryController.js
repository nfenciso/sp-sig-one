import dotenv from "dotenv";
dotenv.config();

const separator1 = process.env.SEPARATOR_1;
const separator2 = process.env.SEPARATOR_2;

import mongoose from 'mongoose';

// get user model registered in Mongoose
const Entry = mongoose.model("Entry");
const Subentry = mongoose.model("Subentry");

const createEntry = async (req, res) => {
    const userEmail = req.body.userEmail;
    const entryTitle = req.body.entryTitle;
    const subEntriesCount = req.body.subentriesCount;
    const genPerm = req.body.generalPermission;

    const newEntry = new Entry({
        userEmail,
        entryTitle,
        generalPermission: genPerm,
        dateGenerated: new Date(),
        qrCode: "-",
        subEntriesCount
    });

    let entry;
    try {
        await newEntry.save().then((results)=>{
            entry = results;
        });
    } catch (error) {
        return res.send({
            success: false,
            error,
            message: "Failure in saving new Entry"
        });
    }

    if (subEntriesCount == 0) {
        return res.send({
            success: true,
            entry,
            message: "Created Entry with no Subentries"
        });
    }

    const subentries = req.body.subentries;

    Promise.all(
        subentries.map(async (subentry)=>{
        // subentries.split("?{#;|;#}%").map(async (subentry)=>{
            // let subentryDetails = subentry.split("*@;;;@!");
    
            // let index = subentryDetails[0];
            // let subentryTitle = subentryDetails[1];
            // let type = subentryDetails[2];
            // let content = subentryDetails[3];
            // let specificPerm = subentryDetails[4];
            
            let index = subentry.index;
            let subentryTitle = subentry.subtitle;
            let type = subentry.type;
            let content = subentry.content;
            let specificPerm = subentry.specificPermissions;
    
            const newSubentry = new Subentry({
                entryId: entry._id,
                index,
                subentryTitle,
                specificPermission: specificPerm,
                type,
                content
            });
    
            try {
                await newSubentry.save();
            } catch (error) {
                return res.send({
                    success: false,
                    error,
                    message: "Failure in saving new Subentry"
                });

                // Add complex error handling
            }
        })
    );

    return res.send({
        success: true,
        message: `Created Entry with ${subEntriesCount} Subentries`
    });
};

const getPersonalEntries = async (req, res) => {
    const email = req.body.email;

    let results;
    try {
        results = await Entry.find({ userEmail: email });
    } catch (error) {
        return res.send({
            success: false,
            error,
            message: "Error getting all personal Entries"
        });
    }

    return res.send({
        success: true,
        results
    });
}

const getPersonalSubEntries = async (req, res) => {
    const entryId = req.body.entryId;

    let results;
    try {
        results = await Subentry.find({ entryId: entryId }).sort({ index: 1});
    } catch (error) {
        return res.send({
            success: false,
            error,
            message: "Error getting all personal SubEntries"
        });
    }

    return res.send({
        success: true,
        results
    });
}

const getPersonalOneEntry = async (req, res) => {
    const entryId = req.body.entryId;

    let results;
    try {
        results = await Entry.findById(entryId);
    } catch (error) {
        return res.send({
            success: false,
            error,
            message: "Error getting details of one Entry"
        });
    }

    return res.send({
        success: true,
        results
    });
}

const getAppropriateEntryDetails = async (req, res) => {
    const entryId = req.body.entryId;
    const email = req.body.email;

    let results;
    try {
        results = await Entry.findById(entryId).sort({ index: 1 });
    } catch (error) {
        return res.send({
            success: false,
            error,
            message: "Error getting details of one Entry"
        });
    }

    let hasAccess = false;
    if (results.generalPermission[0].value != "private") {
        if (results.generalPermission[0].value == "public") {
            hasAccess = true;
        } else {
            let valuesArray = results.generalPermission.map((perm)=>{return perm.value});
            let detailsArray = results.generalPermission.map((perm)=>{return perm.details});

    
            let i = 0;
            for (i; i < valuesArray.length; i++) {
                if (valuesArray[i] == "org" && detailsArray[i].split(",").includes(`@${email.split("@")[1]}`)) {
                    hasAccess = true;
                }
                else if (valuesArray[i] == "persons" && detailsArray[i].split(",").includes(email)) {
                    hasAccess = true;
                }
            }
        }
    }

    if (hasAccess) {
        return res.send({
            success: true,
            access: true,
            results
        });
    } else {
        return res.send({
            success: true,
            access: false,
            results
        });
    }
}

const getAppropriateSubentries = async (req, res) => {
    const entryId = req.body.entryId;
    const email = req.body.email;

    let subentries;
    try {
        subentries = await Subentry.find({ entryId: entryId }).sort({ index: 1 });
    } catch (error) {
        return res.send({
            success: false,
            error,
            message: "Error getting appropriate Subentries"
        });
    }

    let results = [];

    subentries?.map((subentry)=>{
        let hasAccess = false;
        console.log(subentry);
        if (subentry.specificPermission[0].value != "private") {
            if (subentry.specificPermission[0].value == "public") {
                hasAccess = true;
            } else {
                let valuesArray = subentry.specificPermission.map((perm)=>{return perm.value});
                let detailsArray = subentry.specificPermission.map((perm)=>{return perm.details});

                console.log(valuesArray);
                console.log(detailsArray);
                console.log(email);
                
                let i = 0;
                for (i; i < valuesArray.length; i++) {
                    console.log(detailsArray[i].split(",").includes(email));
                    if (valuesArray[i] == "org" && detailsArray[i].split(",").includes(`@${email.split("@")[1]}`)) {
                        hasAccess = true;
                    }
                    else if (valuesArray[i] == "persons" && detailsArray[i].split(",").includes(email)) {
                        hasAccess = true;
                    }
                }
            }
        }

        if (hasAccess) {
            results.push(subentry);
        }
    });

    

    return res.send({
        success: true,
        results
    });
} 

export { createEntry, getPersonalEntries, getPersonalSubEntries, getPersonalOneEntry, getAppropriateEntryDetails,
    getAppropriateSubentries };