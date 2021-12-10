import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent } from '@ticketshub/commun';
import { queueGropuName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updarted-publisher';
//import { natsWrapper } from '../../../nats-wrapper';


//esta escucjhando las ordenes creadas en orderpyt
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;//es el canal

    queueGropuName = queueGropuName;//cado los servicios de order  conectaron a este canal y crearon una suscripción, se unieron a este grupo

    //lo del mensaje es algo que nos habla de los datos subyacentes procedentes del servidor de nats
    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        };

        //marco el ticket como reservado
        ticket.set({ orderId: data.id });
        await ticket.save();
        //emito evento de actualizacion de ticket(este evento lo esta escuchando orderpyt)
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
            orderId: ticket.orderId
        });

        msg.ack();
    }
}