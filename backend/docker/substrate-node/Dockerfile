FROM phusion/baseimage:jammy-1.0.0
ARG XXNETWORK_VERSION
LABEL maintainer "@xx-labs"
LABEL description="xx network public node"
RUN apt-get update && apt-get install wget -y
WORKDIR /usr/local/bin
RUN wget https://github.com/xx-labs/xxchain/releases/download/$XXNETWORK_VERSION/xxnetwork-chain \
    && chmod +x xxnetwork-chain
EXPOSE 15974 30334 9933
VOLUME ["/data"]
ENTRYPOINT ["xxnetwork-chain"]
