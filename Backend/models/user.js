import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  restaurantId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
    validate: {
      validator: async function(value) {
        const restaurant = await mongoose.model('Restaurant').exists({ _id: value });
        return restaurant;
      },
      message: props => `Restaurant ${props.value} does not exist`
    }
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Add virtual age property
UserSchema.virtual('age').get(function() {
  if (!this.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const User = mongoose.model("User", UserSchema);
export default User;