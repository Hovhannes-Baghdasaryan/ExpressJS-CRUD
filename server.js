import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();

let events = fs.promises.readFile(path.resolve("eventsData.json"), "utf8");

// middleware
app.use(express.json());
app.use(cors());

// CREATE
app.post("/events", async (req, res) => {
	const id = `event_${Date.now()}_${Math.random()}`;

	const newEvent = {
		id,
		...req.body,
	};

	const response = await events;

	const dataObject = JSON.parse(response);

	const arrayOfId = Object.keys(dataObject);

	const lastId = arrayOfId.length ? ++arrayOfId[arrayOfId.length - 1] : 1;

	const finalObject = {
		[lastId]: newEvent,
	};

	fs.promises.writeFile(path.resolve("eventsData.json"), JSON.stringify({ ...JSON.parse(response), ...finalObject }, undefined, 10));
	res.send(response);
});

// READ
app.get("/events/:id", async (req, res) => {
	const response = await events;

	const eventsObject = JSON.parse(response);

	const event = eventsObject[req.params.id];

	if (event) {
		res.send(event);
	} else {
		res.status(404).send("Event not found");
	}
});

// UPDATE
app.put("/events/:id", async (req, res) => {
	const response = await events;

	const parseEvent = JSON.parse(response);

	const event = parseEvent[req.params.id];

	if (event) {
		const updatedEvent = req.body;

		const finalObject = {
			...parseEvent,
			[req.params.id]: updatedEvent,
		};

		fs.promises.writeFile(path.resolve("eventsData.json"), JSON.stringify(finalObject, undefined, 10));

		res.send(updatedEvent);
	} else {
		res.status(404).send("Event not found");
	}
});

// DELETE
app.delete("/events/:id", async (req, res) => {
	const paramsId = req.params.id;

	const response = await events;

	const objectParse = JSON.parse(response);

	const event = objectParse[paramsId];

	delete objectParse[paramsId];

	if (event) {
		fs.promises.writeFile(path.resolve("eventsData.json"), JSON.stringify(objectParse, undefined, 10));
		res.send();
	} else {
		res.status(404).send("Event not found");
	}
});

// SEARCH
app.get("/events", async (req, res) => {
	const { type, name } = req.query;

	const response = await events;

	const eventsObject = JSON.parse(response);

	const results = Object.values(eventsObject).filter(event => {
		if (event.type !== type && type) return false;
		if (event.name !== name && name) return false;
		return true;
	});

	res.send(results);
});

app.listen(process.env.PORT, () => console.log(`Server runs on ${process.env.PORT}`));
