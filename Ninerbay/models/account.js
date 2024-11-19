import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import bcrypt from 'bcrypt';


const accountSchema = new Schema({
    username: { type: String, required: [true, 'username is required'] },
    email: { type: String, required: [true, 'email is required'] },
    password: { type: String, required: [true, 'password is required'] }
});

accountSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

accountSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.model('Account', accountSchema);