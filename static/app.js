const app = Vue.createApp({
  data() {
    return {
      drawing: false,
      drawingStates: [],
      id: window.location.pathname.slice(1),
      url: window.location.href,
      showUrlBox: false,
    };
  },
  created() {
    this.showUrlBox = this.id ? true : false;
    if(this.showUrlBox){
      console.log("true");
    }
  },
  mounted() {
    this.loadCanvas();
  },
  methods: {
    startDrawing(event) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      let touch = event.touches ? event.touches[0] : event;
      this.drawing = true;
      this.ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
      this.saveDrawingState();
    },
    draw(event) {
      if (!this.drawing) return;
      const rect = this.$refs.canvas.getBoundingClientRect();
      let touch = event.touches ? event.touches[0] : event;
      this.ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      this.ctx.stroke();
    },
    stopDrawing() {
      this.drawing = false;
    },
    resetCanvas() {
      this.ctx.reset();
      this.drawingStates = [];
    },
    saveDrawingState() {
      this.drawingStates.push(this.$refs.canvas.toDataURL());
    },
    undoLastDrawing() {
      if (this.drawingStates.length > 0) {
        this.drawingStates.pop();
        let lastState = this.drawingStates[this.drawingStates.length - 1];
        let img = new Image();
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
      axios.post('/save', {
        id: this.id,
        dataUrl: dataUrl
      })
      .then(response => {
        console.log("save received")
        this.id = response.data.id;
        this.showUrlBox = true;
        window.location.href = window.location.origin + '/' + this.id;
      });
    },
    loadCanvas() {
      console.log('loaded');
      if (this.id) {
        console.log('loaded id');
        axios.get('/a/load/' + this.id)
          .then(response => {
            let img = new Image();
            img.onload = () => {
              this.ctx.drawImage(img, 0, 0);
            };
            img.src = response.data.dataUrl;
          });
      }
    },
    copyUrl() {
      navigator.clipboard.writeText(this.url).then(() => {
        alert('URL copied to clipboard');
      }, (err) => {
        console.error('Failed to copy URL: ', err);
      });
    }
  },
  computed: {
    ctx() {
      return this.$refs.canvas.getContext('2d');
    }
  }
  },
);

app.mount('#app');
