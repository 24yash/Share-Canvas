const app = Vue.createApp({
  data() {
    return {
      drawing: false,
      drawingStates: [], // stores drawing states in an array
      id: window.location.pathname.slice(1), //empty string when visiting for first time
      url: window.location.href,
      showUrlBox: false, //whether to show url box below canvas or not
    };
  },
  created() {
    this.showUrlBox = this.id ? true : false;
    if (this.showUrlBox) {
      console.log("true");
    }
  },
  mounted() {
    this.loadCanvas();
  },
  methods: {
    startDrawing(event) {
      // This method returns an object with properties top, left, right, bottom, width, and height that describe the size of the element and its position relative to the viewport.
      const rect = this.$refs.canvas.getBoundingClientRect(); //part of Web APIs provided by browser

      // check if it is a touch event if so set touch so the first touch point
      let touch = event.touches ? event.touches[0] : event;

      this.drawing = true;

      //ctx is our computed property for canvas.getContext("2d")
      // without this line we wont know where user started drawing and we will continue stroke from last drawing point to the new event point
      this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
      // moves the starting point of a new sub-path to the (x, y) coordinates.
      this.saveDrawingState();
    },
    draw(event) {
      if (!this.drawing) return;
      const rect = this.$refs.canvas.getBoundingClientRect();
      let touch = event.touches ? event.touches[0] : event;

      // adds a straight line to the current sub-path by connecting the last point in the sub-path to the specified (x, y) coordinates
      this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);

      // this is what will draw the actual line
      this.ctx.stroke();
    },
    stopDrawing() {
      this.drawing = false;
      this.saveDrawingState();
    },
    resetCanvas() {
      this.ctx.reset();
      this.drawingStates = [];
    },
    saveDrawingState() {
      // called after stopdrawing
      this.drawingStates.push(this.$refs.canvas.toDataURL());
    },
    undoLastDrawing() {
      if (this.drawingStates.length > 0) {
        this.drawingStates.pop();
        let lastState = this.drawingStates[this.drawingStates.length - 1];
        let img = new Image();

        // img on load event haandler when lastState is loaded
        img.onload = () => {
          this.ctx.reset();
          this.ctx.drawImage(img, 0, 0);
        };

        if (this.drawingStates.length > 0) {
          img.src = lastState;
        } else {
          this.ctx.reset();
        }
      }
    },
    saveCanvas() {
      let dataUrl = this.$refs.canvas.toDataURL();
      axios
        .post("/save", {
          id: this.id,
          dataUrl: dataUrl,
        })
        .then((response) => {
          console.log("save received");
          this.id = response.data.id;
          this.showUrlBox = true;
          window.location.href = window.location.origin + "/" + this.id;
        });
    },
    loadCanvas() {
      // called upon mounting
      console.log("loading");
      if (this.id) {
        console.log("loaded id");
        axios.get("/a/load/" + this.id).then((response) => {
          let img = new Image();
          img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
          };
          img.src = response.data.dataUrl;
        });
      }
    },
    copyUrl() {
      navigator.clipboard.writeText(this.url).then(
        () => {
          alert("URL copied to clipboard");
        },
        (err) => {
          console.error("Failed to copy URL: ", err);
        }
      );
    },
  },
  computed: {
    ctx() {
      return this.$refs.canvas.getContext("2d");
    },
  },
});

app.mount("#app");
