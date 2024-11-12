import mongoose from 'mongoose';

const { Schema } = mongoose;

const accountSchema = new Schema({
    username: { type: String, required: [true, 'username is required'] },
    email: { type: String, required: [true, 'email is required'] },
    password: { type: String, required: [true, 'password is required'] }
});

export default mongoose.model('Account', accountSchema);