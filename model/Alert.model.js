import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

export const AlertSchema = mongoose.Schema(
	{
		type: {
			type: String,
			enums: ["auth", "wallet", "job", "connection", "profile"],
			required: true,
		},
		message: {
			type: String,
			required: true,
		},
		user: {
			
		},
		status: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true }
);

AlertSchema.plugin(mongoosePaginate);

export default mongoose.model("Alert", AlertSchema);
