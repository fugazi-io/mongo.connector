/**
 * Created by nitzan on 20/02/2017.
 */

import { MongoFacade } from "./shared";
import * as connector from "fugazi.connector.node";

let MONGO: MongoFacade;

type MongoListDatabasesResult = {
	databases: Array<{ name: string; sizeOnDisk: number; empty: boolean; }>;
}

async function list(ctx: connector.CommandHandlerContext) {
	try {
		const db: MongoListDatabasesResult = await (await MONGO.admin()).listDatabases();

		ctx.type = "application/json";
		ctx.body = {
			status: 0, // value for fugazi.components.commands.handler.ResultStatus.Success
			value: {
				count: db.databases.length,
				items: db.databases.map(db => {
					return {name: db.name};
				})
			}
		};
	} catch (e) {
		ctx.type = "application/json";
		ctx.body = {
			status: 1, // value for fugazi.components.commands.handler.ResultStatus.Failure
			error: e.message
		};
	}
}

export function init(builder: connector.Builder, mongo: MongoFacade): connector.Module {
	MONGO = mongo;
	builder.command("/dbs", "get", list);

	return {
		title: "database commands",
		types: {
			database: {
				title: "a database",
				type: {
					name: "string"
				}
			},
			databases: {
				title: "databases",
				type: {
					count: "numbers.integer",
					items: "list<database>"
				}
			}
		},
		commands: {
			list: {
				title: "returns all of the databases in this mongo",
				returns: "databases",
				syntax: "list dbs",
				handler: {
					endpoint: "dbs"
				}
			}
		}
	};
}
