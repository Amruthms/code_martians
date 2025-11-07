FROM python:3.10-slim
WORKDIR /app

# Copy model into image
COPY best.pt /app/best.pt

# This service's job is to populate a shared volume with the model file.
# At container start, entrypoint will copy the model into mounted /models.
COPY copy_model.sh /app/copy_model.sh
RUN chmod +x /app/copy_model.sh

VOLUME ["/models"]

EXPOSE 5000

CMD ["/app/copy_model.sh"]
