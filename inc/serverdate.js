var ServerDateData={
  offset: 0
};

function ServerDate() {
  if(!ServerDateData.offset)
    return new Date();

  return new Date(new Date().getTime()-ServerDateData.offset);
}

ServerDate.set=function(data) {
  ServerDateData.data=data;
  ServerDateData.round_trip=new Date(data.receive_back).getTime()-new Date(data.timestamp).getTime();
  ServerDateData.offset=(new Date().getTime()-new Date(data.received).getTime())-ServerDateData.round_trip/2;
}
