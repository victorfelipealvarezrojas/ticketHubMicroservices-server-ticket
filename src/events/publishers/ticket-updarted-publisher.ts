import { Publisher, Subjects, TicketUpdatedEvent } from "@ticketshub/commun";
import { natsWrapper } from "../../../nats-wrapper";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdate = Subjects.TicketUpdate;
}
