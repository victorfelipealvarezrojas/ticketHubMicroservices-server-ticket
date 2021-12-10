import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCancelledEvent } from '@ticketshub/commun';
import { queueGropuName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updarted-publisher';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;

    queueGropuName = queueGropuName;

    async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error('Ticket not found');
        };

        //dejo qie ticket como no asociado a ninguna orden
        ticket.set({ orderId: undefined });
        await ticket.save();

        //emite evento de que el ticket fue actualizado
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