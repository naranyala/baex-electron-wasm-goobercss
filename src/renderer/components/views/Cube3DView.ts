import { css } from 'goober';

const styles = {
  container: css`
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #c9d1d9;
    font-family: 'Inter', sans-serif;
    min-height: 80vh;
  `,
  canvas: css`
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    cursor: move;
  `,
  info: css`
    margin-top: 20px;
    text-align: center;
    color: #8b949e;
    font-size: 14px;
    line-height: 1.6;
  `
};

export const Cube3DView = {
  name: 'cube-3d-view',
  initialState: {
    rotation: { x: 0, y: 0, z: 0 },
    isRotating: true
  },
  render: (state) => {
    return `
      <style>:host { display: block; }</style>
      <div class="${styles.container}">
        <h2 style="margin-bottom: 20px; color: #f0f6fc;">Linear Algebra: 3D Projection</h2>
        <canvas id="cube-canvas" class="${styles.canvas}" width="600" height="600"></canvas>
        <div class="${styles.info}">
          The cube is rendered using a basic 3D-to-2D orthographic projection.<br/>
          Vertices are rotated using 3D rotation matrices and projected onto the 2D screen.
        </div>
      </div>
    `;
  },
  mounted: (el, state) => {
    const canvas = el.shadowRoot?.getElementById('cube-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    let angleX = 0, angleY = 0, angleZ = 0;
    const scale = 100;
    const offset = { x: canvas.width / 2, y: canvas.height / 2 };

    function project(v: number[]) {
      const x = v[0], y = v[1], z = v[2];
      // Simple orthographic projection
      return {
        x: x * scale + offset.x,
        y: y * scale + offset.y
      };
    }

    function rotateX(v: number[], a: number) {
      const cos = Math.cos(a), sin = Math.sin(a);
      return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
    }

    function rotateY(v: number[], a: number) {
      const cos = Math.cos(a), sin = Math.sin(a);
      return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
    }

    function rotateZ(v: number[], a: number) {
      const cos = Math.cos(a), sin = Math.sin(a);
      return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos, v[2]];
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (state.isRotating) {
        angleX += 0.01;
        angleY += 0.015;
        angleZ += 0.005;
      }

      const transformed = vertices.map(v => {
        let rv = rotateX(v, angleX);
        rv = rotateY(rv, angleY);
        rv = rotateZ(rv, angleZ);
        return project(rv);
      });

      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      edges.forEach(([start, end]) => {
        const p1 = transformed[start];
        const p2 = transformed[end];
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      });
      ctx.stroke();

      requestAnimationFrame(draw);
    }

    draw();
  }
};
