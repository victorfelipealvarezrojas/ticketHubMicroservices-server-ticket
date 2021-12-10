import mongoose from 'mongoose';
import { natsWrapper } from '../nats-wrapper';
import { app } from './app';
import { OrderCreatedListener } from './events/listener/order-created-listener';
import { OrderCancelledListener } from './events/listener/order_cancelled_listener';

const start = async () => {
  if (!process.env.JWT_KEY) throw new Error("JWT_KEY must be defined");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI must be defined");
  if (!process.env.NATS_CLIENT_ID) throw new Error("NATS_CLIENT_ID must be defined");
  if (!process.env.NATS_URL) throw new Error("NATS_URL must be defined");
  if (!process.env.NATS_CLUSTER_ID) throw new Error("NATS_CLUSTER_ID must be defined");

  try {
    //coneccion a nats, que es el bus de eventos, ticketing es el id del cluster que tengo definido e n lsoa rchivos de implementacion
    await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL);

    //escucha el cierre del client para matar la comunmicacion con el bus de eventos, incluso si elimino el pod de la nats se ejecutara este cierre
    natsWrapper.getClient.on('close', () => {
      console.log('NATS connection closed!!!!');
      process.exit();//reacciona a la accion de cerrar el cliente inculso desde la consola
    });

    process.on('SIGINT', () => natsWrapper.getClient.close());
    process.on('SIGTERM', () => natsWrapper.getClient.close());

    //listener del nats, escuchando los publisher de la creacion y actualizacion de ticket(ticketpyt)
    new OrderCreatedListener(natsWrapper.getClient).listen();//cuando se crea un nuevo ticket en ticketpyt
    new OrderCancelledListener(natsWrapper.getClient).listen();//cuando se actualiza un ticket en ticketpyt

    //conneccion a mongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      //useNewUrlParser: true,//no va en las nuevas versiones de mongo
      //useUnifiedTopology: true,
      //usecreateIndex:true
    });
    console.log('connecting to mongodb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log("v01");
    console.log("listening on port 3000 add routes");
  });

}

start();
