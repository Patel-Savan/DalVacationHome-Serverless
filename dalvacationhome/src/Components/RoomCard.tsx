import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
} from "@mui/material";

interface Room {
  id: number;
  type: string;
  price: number;
  available: boolean;
  imageUrl: string;
}

const RoomCard: React.FC<{ room: Room }> = ({ room }) => {
  return (
    <Card className="h-full">
      <CardMedia
        component="img"
        height="140"
        image={room.imageUrl}
        alt="room image"
      />
      <CardContent className="flex flex-col justify-between">
        <div>
          <Typography gutterBottom variant="h5" component="div">
            {room.type}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Price: ${room.price}
          </Typography>
          <Typography variant="body2" color={room.available ? "green" : "red"}>
            {room.available ? "Available" : "Not Available"}
          </Typography>
        </div>
        <Button
          size="small"
          variant="contained"
          color="primary"
          disabled={!room.available}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
