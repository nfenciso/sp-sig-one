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

    const newEntry = new Entry({
        userEmail,
        entryTitle,
        generalPermission: "-",
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
        subentries.split("?{#;|;#}%").map(async (subentry)=>{
            let subentryDetails = subentry.split("*@;;;@!");
    
            let index = subentryDetails[0];
            let subentryTitle = subentryDetails[1];
            let type = subentryDetails[2];
            let content = subentryDetails[3];
    
            const newSubentry = new Subentry({
                entryId: entry._id,
                index,
                subentryTitle,
                specificPermission: "-",
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
        results = await Subentry.find({ entryId: entryId });
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

export { createEntry, getPersonalEntries, getPersonalSubEntries };