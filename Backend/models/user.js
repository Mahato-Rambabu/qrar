import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, // Global uniqueness for phone
    dob: { type: Date, required: true },
    restaurants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for customerIdentifier (user's ID)
UserSchema.virtual("customerIdentifier").get(function () {
  return this._id.toString();
});

const User = mongoose.model("User", UserSchema);
export default User;
