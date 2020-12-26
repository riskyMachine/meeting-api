const express = require("express");
const router = new express.Router();
const { getMeetingsBetweenTime, getMeetingsByParticipant, createMeeting, getMeeting } = require('./controller');

router.post("/meetings", async (req, res) => {
	try {
		let result = await createMeeting(req.body)
		res.send(result);
	} catch (e) {
		console.log(e)
		res.send({ "status": "Failed", "msg": "Something went wrong." });
	}
});

router.get("/meeting/:id", async (req, res) => {
	try {

		let result = await getMeeting(req.params)
		res.send(result);

	} catch (e) {
		console.log(e)
		res.send({ "status": "Failed", "msg": "Something went wrong." });
	}
});

router.get("/meetings", async (req, res) => {
	try {
		let result = []
		if(req.query.start && req.query.end){
			result = await getMeetingsBetweenTime(req.query)
		}
		else if(req.query.participant){
			result = await getMeetingsByParticipant(req.query)
		}
		res.send(result)
	} catch (e) {
		console.log(e)
		res.send({ "status": "Failed", "msg": "Something went wrong." });
	}
});


module.exports = router;