import moongose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//proipiedades que se requieren para crear un registro
interface TicketAtttrs {
    title: string;
    price: number;
    userId: string;
}

//las propiedades que requiere un registro guardado, un solo documento o registro
//vun documento que describa las propiedades que el ticket tiene
interface TicketDoc extends moongose.Document {
    title: string;
    price: number;
    userId: string;
    version: number;//para controlar la version del registro
    orderId: string;
}

//el modelo representaba todas las diferentes propiedades que se iban a asignar al modelo,toda la coleccion de datos
interface TicketModel extends moongose.Model<TicketDoc> {
    build(attrs: TicketAtttrs): TicketDoc
}

const ticketSchema = new moongose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    OrderId: {
        type: String,
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
});

//para controlar la version del registro
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

//va a ser la única forma en que creamos nuevos registros para permitor que typescript me ayude con als propiedades
ticketSchema.statics.build = (atttrs: TicketAtttrs) => {
    return new Ticket(atttrs)
};

//vamar a la función real proporcionará un nombre para la recolección de boletos
const Ticket = moongose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };