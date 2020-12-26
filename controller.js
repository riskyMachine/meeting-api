const { Meeting } = require('./models/meeting.model');
const uuid = require('uuid');

const convertTimezone = (datesObj, region) => {
    let dates = {};
    for (let date in datesObj) {
        dates[date] = new Date(datesObj[date]).toLocaleString("en-US", region);
    }
    return dates;
};

const formatMeeting = (doc, ret) => {
    let { startTime, endTime, createdAt, updatedAt } = ret;
    delete ret._id;
    if (startTime && endTime && createdAt && updatedAt) {
        return { ...ret, ...convertTimezone({ startTime, endTime, createdAt, updatedAt }, "Asia/Kolkata") };
    }
    return ret;
};

const meetingValidation = async ({ email, endTime, startTime }) => {
    let result = await Meeting.aggregate([
        { $unwind: "$participants"},
        { $match: { "participants.email": email, "participants.rsvp": "Yes" } },
        { $match: { $and: [{ startTime: { $gte: startTime } }, { startTime: { $lte: endTime } }] } },
        { $match: { $and: [{ endTime: { $gte: startTime } }, { endTime: { $lte: endTime } }] } }
    ]);
    return result.length === 0 ? true : false;
};

module.exports = {
    getMeetingsBetweenTime: async function (Obj) {
        
        let { start, end, participant, page, limit } = Obj;
        let result = [], skip = (page-1)*limit;
        if(isNaN(limit) || !limit) limit = 50
        else limit = limit*1
        if(isNaN(skip) || !skip) skip = 0
        start = new Date(start);
        end = new Date(end);
        if (participant) {
            result = await Meeting.aggregate([
                { $match: { "participants.email": `${participant}` } },
                {
                    $match: {
                        $and: [
                            { startTime: { $gte: start } },
                            { endTime: { $lte: end } }
                        ]
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ]);
        }
        else {
            result = await Meeting.aggregate([
                {
                    $match: {
                        $and: [
                            { startTime: { $gte: start } },
                            { endTime: { $lte: end } }
                        ]
                    }
                },
                { $skip: skip },
                { $limit: limit }
            ]);
        }
        return result;
    },
    getMeetingsByParticipant: async function (Obj) {
        let { participant, limit, page } = Obj;
        let skip = (page-1)*limit;
        if(isNaN(limit) || !limit) limit = 50
        else limit = limit*1
        if(isNaN(skip) || !skip) skip = 0
        result = await Meeting.aggregate([
            { $match: { "participants.email": `${participant}` } },
            { $skip: skip },
            { $limit: limit }
        ]);
        return result;
    },
    createMeeting: async function (Obj) {
        
        let { startTime, endTime } = Obj;
        let meetingId = uuid.v4();
        startTime = new Date(startTime);
        endTime = new Date(endTime);

        if (startTime.getTime() < Date.now() || endTime.getTime() < startTime.getTime()) {
            return { "status": "Failed", "msg": "End time > Start time > Current time" };
        }

        for (let i = 0; i < Obj.participants.length; i++) {
            let participant = Obj.participants[i];
            if(participant.rsvp === "Yes"){
                let result = await meetingValidation({ email: participant.email, startTime, endTime });
                if (!result) {
                    return { "status": "Failed", "msg": `${participant.email} already attending meeting in same time slot.` };
                }    
            }
        }

        let meeting = new Meeting({ ...Obj, startTime, endTime, meetingId });
        await meeting.save();
        meeting = meeting.toObject({ transform: formatMeeting });

        return meeting;
    },
    getMeeting: async function (Obj) {
        let meetingId = Obj.id;
        let meeting = await Meeting.findOne({ meetingId });
        meeting = meeting.toObject({ transform: formatMeeting });

        return meeting;
    }
};