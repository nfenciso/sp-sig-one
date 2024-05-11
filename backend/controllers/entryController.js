
const PUBLIC_OPTION = "public";
const ORG_OPTION = "org";
const PERSONS_OPTION = "persons";
const PRIVATE_OPTION = "private";

const S_RETAIN_OPTION = "retain";
const S_PRIVATIZE_OPTION = "privatize";
const S_NEWTYPE_ORG_OPTION = "neworg";
const S_NEWTYPE_PERSONS_OPTION = "newpersons";
const S_MORE_SPECIFIC_ORG_OPTION = "morespecificorg";
const S_MORE_SPECIFIC_PERSONS_OPTION = "morespecificpersons";

import mongoose from 'mongoose';

// get user model registered in Mongoose
const Entry = mongoose.model("Entry");
const Subentry = mongoose.model("Subentry");

const createEntry = async (req, res) => {
    const userEmail = req.body.userEmail;
    const entryTitle = req.body.entryTitle;
    const subEntriesCount = req.body.subentriesCount;
    const genPermission = req.body.genPermission;
    const genPermissionDetails = req.body.genPermissionDetails;

    const newEntry = new Entry({
        userEmail,
        entryTitle,
        generalPermission: [genPermission, genPermissionDetails],
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
            let specificPermission = subentry.specificPermission;
            let specificPermissionDetails = subentry.specificPermissionDetails;
    
            const newSubentry = new Subentry({
                entryId: entry._id,
                userEmail,
                index,
                subentryTitle,
                specificPermission: [specificPermission, specificPermissionDetails],
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

const deleteEntry = async (req, res) => {
    const id = req.body.id;

    try {
        await Entry.findByIdAndDelete(id);
        await Subentry.deleteMany({ entryId: id });
    } catch (error) {
        console.log(error);    
    }

    return res.send({
        success: true
    });
}

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
    let isOwner = false;
    if (results?.userEmail == email) {
        hasAccess = true;
        isOwner = true;
    }
    if (results && !hasAccess && results.generalPermission[0] != PRIVATE_OPTION) {
        if (results.generalPermission[0] == PUBLIC_OPTION) {
            hasAccess = true;
        } else {
            let detailsArray = results.generalPermission[1].map((perm)=>{return perm.value});
            console.log(detailsArray);

            if (results.generalPermission[0] == ORG_OPTION && detailsArray.includes(email.split("@")[1])) {
                hasAccess = true;
            }
            else if (results.generalPermission[0] == PERSONS_OPTION && detailsArray.includes(email)) {
                hasAccess = true;
            }
        }
    }

    if (hasAccess) {
        return res.send({
            success: true,
            access: true,
            results,
            isOwner
        });
    } else {
        return res.send({
            success: true,
            access: false,
            results,
            isOwner
        });
    }
}

const getAppropriateSubentries = async (req, res) => {
    const entryId = req.body.entryId;
    const email = req.body.email;
    const generalPermission = req.body.generalPermission;

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
    let isOwner = false;

    console.log(generalPermission);
    console.log("======");

    subentries?.map((subentry)=>{
        let hasAccess = false;
        console.log(">>");
        console.log(subentry.specificPermission);

        // UNCOMMENT
        if (subentry.userEmail == email) {
            hasAccess = true;
            isOwner = true;
        }

        // const S_RETAIN_OPTION = "retain";
        // const S_PRIVATIZE_OPTION = "privatize";
        // const S_NEWTYPE_ORG_OPTION = "neworg";
        // const S_NEWTYPE_PERSONS_OPTION = "newpersons";
        // const S_MORE_SPECIFIC_ORG_OPTION = "morespecificorg";
        // const S_MORE_SPECIFIC_PERSONS_OPTION = "morespecificpersons";
        let specificPermission = subentry.specificPermission;
        if (!hasAccess && specificPermission[0] != S_PRIVATIZE_OPTION) {
            let actualPermission;
            if (specificPermission[0] == S_RETAIN_OPTION) {
                actualPermission = generalPermission;
            }
            else if ([S_NEWTYPE_ORG_OPTION, S_NEWTYPE_PERSONS_OPTION].includes(specificPermission[0])) {
                actualPermission = generalPermission.concat(specificPermission);
                //actualPermission = specificPermission.concat(generalPermission);
            }
            else if ([S_MORE_SPECIFIC_ORG_OPTION, S_MORE_SPECIFIC_PERSONS_OPTION].includes(specificPermission[0])) {
                actualPermission = specificPermission;
            }

            if (
                [ORG_OPTION, S_NEWTYPE_ORG_OPTION, S_MORE_SPECIFIC_ORG_OPTION,
                    PERSONS_OPTION, S_NEWTYPE_PERSONS_OPTION, S_MORE_SPECIFIC_PERSONS_OPTION
                ].includes(actualPermission[0])
            ) {
                let newArr = [];
                actualPermission[1].map((obj)=>{
                    newArr.push(obj.value);
                });

                actualPermission[1] = newArr;
            }

            if (
                [ORG_OPTION, S_NEWTYPE_ORG_OPTION, S_MORE_SPECIFIC_ORG_OPTION,
                    PERSONS_OPTION, S_NEWTYPE_PERSONS_OPTION, S_MORE_SPECIFIC_PERSONS_OPTION
                ].includes(actualPermission[2])
            ) {
                let newArr = [];
                actualPermission[3].map((obj)=>{
                    newArr.push(obj.value);
                });

                actualPermission[3] = newArr;
            }

            console.log("--");
            console.log(actualPermission);
            
            if (actualPermission[0] == PUBLIC_OPTION) {
                hasAccess = true;
            }
            else if ([ORG_OPTION, S_NEWTYPE_ORG_OPTION, S_MORE_SPECIFIC_ORG_OPTION].includes(actualPermission[0]) 
            && actualPermission[1].includes(email.split("@")[1])) {
                hasAccess = true;
            }
            else if ([PERSONS_OPTION, S_NEWTYPE_PERSONS_OPTION, S_MORE_SPECIFIC_PERSONS_OPTION].includes(actualPermission[0])
            && actualPermission[1].includes(email)) {
                hasAccess = true;
            }

            console.log("temp:", hasAccess);

            if (actualPermission.length > 2) {
                if ([ORG_OPTION, S_NEWTYPE_ORG_OPTION, S_MORE_SPECIFIC_ORG_OPTION].includes(actualPermission[2])) {
                    if (hasAccess && !actualPermission[3].includes(email.split("@")[1])) {
                        hasAccess = false;
                    }
                }
                else if ([PERSONS_OPTION, S_NEWTYPE_PERSONS_OPTION, S_MORE_SPECIFIC_PERSONS_OPTION].includes(actualPermission[2])) {
                    if (hasAccess && !actualPermission[3].includes(email)) {
                        hasAccess = false;
                    }
                }
            }
        }

        // if (!hasAccess && subentry.specificPermission[0].value != "private") {
            // if (subentry.specificPermission[0].value == "public") {
            //     hasAccess = true;
            // } else {
            //     let valuesArray = subentry.specificPermission.map((perm)=>{return perm.value});
            //     let detailsArray = subentry.specificPermission.map((perm)=>{return perm.details});

            //     console.log(valuesArray);
            //     console.log(detailsArray);
            //     console.log(email);
                
            //     let i = 0;
            //     for (i; i < valuesArray.length; i++) {
            //         console.log(detailsArray[i].split(",").includes(email));
            //         if (valuesArray[i] == "org" && detailsArray[i].split(",").includes(`@${email.split("@")[1]}`)) {
            //             hasAccess = true;
            //         }
            //         else if (valuesArray[i] == "persons" && detailsArray[i].split(",").includes(email)) {
            //             hasAccess = true;
            //         }
            //     }
            // }
        // }
        console.log(hasAccess);
        console.log("<<");

        if (hasAccess) {
            results.push(subentry);
        }
    });

    //console.log("+++++++++++++", results);

    

    return res.send({
        success: true,
        results,
        isOwner
    });
} 

export { createEntry, getPersonalEntries, getPersonalSubEntries, getPersonalOneEntry, getAppropriateEntryDetails,
    getAppropriateSubentries, deleteEntry };