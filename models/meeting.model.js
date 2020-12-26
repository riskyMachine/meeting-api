const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
		name: {
			type: String,
			required: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			trim: true,
		},
		rsvp: {
			type: String,
			required: true,
			trim: true,
			default: "Not Answered"
		}
	}
);

const meetingSchema = new mongoose.Schema({
	meetingId: {
		type: String,
		unique: true,
		required: true,
		trim: true
	},
	title: {
		type: String,
		required: true,
		trim: true,
	},
	startTime: {
		type: Date,
		required: true
	},
	endTime: {
		type: Date,
		required: true
	},
	participants: [participantSchema],
},
	{
		timestamps: true,
		versionKey: false,
	}
);

const Participant = mongoose.model("Participant", participantSchema);
const Meeting = mongoose.model("Meeting", meetingSchema);

module.exports = { Meeting, Participant };