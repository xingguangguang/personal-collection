<template>
  <div class="qr-code-generator">
    <h2>二维码生成器</h2>
    <div class="input-section">
      <el-input
        v-model="qrText"
        placeholder="请输入要生成二维码的内容"
        clearable
      />
      <el-button
        type="primary"
        @click="generateQRCode"
        :disabled="!qrText"
      >
        生成二维码
      </el-button>
    </div>
    <div>
      <div class="qrcode-options">
        <el-form>
          <el-form-item label="形状">
            <el-select v-model="qrcodeOptions.shape">
              <el-option
                value="circle"
                label="圆形"
              ></el-option>
              <el-option
                value="square"
                label="正方形"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="大小">
            <el-slider
              style="width: 300px"
              v-model="qrcodeOptions.size"
              :min="32"
              :max="500"
            />
          </el-form-item>
          <el-form-item label="颜色">
            <el-radio-group v-model="qrcodeOptions.colorType">
              <el-radio
                value="single"
                label="single"
              >
                单色
              </el-radio>
              <el-radio
                value="gradient"
                label="gradient"
              >
                渐变色
              </el-radio>
            </el-radio-group>
            <el-radio-group
              v-if="qrcodeOptions.colorType === 'gradient'"
              v-model="qrcodeOptions.gradient.type"
            >
              <el-radio value="linear">线性渐变</el-radio>
              <el-radio value="radial">径向渐变</el-radio>
            </el-radio-group>
            <el-color-picker v-model="qrcodeOptions.color" />
            <template v-if="qrcodeOptions.colorType === 'gradient'">
              <el-color-picker v-model="qrcodeOptions.gradient.colorStops[0].color" />
              <el-color-picker v-model="qrcodeOptions.gradient.colorStops[1].color" />
            </template>
            <el-input
              v-if="qrcodeOptions.gradient.type === 'linear'"
              type="number"
              :min="0"
              :max="360"
              v-model="qrcodeOptions.gradient.rotation"
            ></el-input>
          </el-form-item>
          <el-form-item label="图案形状">
            <el-select v-model="qrcodeOptions.dotShape">
              <el-option
                value="square"
                label="矩形"
              ></el-option>
              <el-option
                value="rounded"
                label="圆角矩形"
              ></el-option>
              <el-option
                value="dots"
                label="圆"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <div class="qr-code-display">
        <div ref="qrCodeRef"></div>
        <el-button @click="downloadQRCode">下载二维码</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import QRCodeStyling from 'qr-code-styling';
import logo from '@/assets/logo.png';

// 响应式数据
const qrText = ref('');
const qrcodeOptions = ref({
  shape: 'square',
  size: 300,
  logo: '',
  colorType: 'single',
  color: '#4267b2',
  gradient: {
    type: 'linear',
    rotation: 0,
    colorStops: [
      { offset: 0, color: '#000000' },
      { offset: 1, color: '#000000' }
    ]
  },
  dotShape: 'rounded'
});
const qrCodeData = ref('');
const qrCodeRef = ref(null);

// 生成二维码的方法
const generateQRCode = async () => {
  if (!qrText.value) return;
  const { shape, size, color, dotShape, colorType, gradient } = qrcodeOptions.value;

  try {
    qrCodeRef.value.innerHTML = '';
    const params = {
      data: qrText.value,
      width: size,
      height: size,
      shape,
      dotsOptions: {
        color,
        type: dotShape,
        gradient: colorType === 'single' ? null : gradient
      },
      cornersSquareOptions: {
        type: dotShape === 'dots' ? 'dot' : dotShape
      },
      cornersDotOptions: {
        type: dotShape === 'dots' ? 'dot' : dotShape
      },
      backgroundOptions: {
        color: '#e9ebee'
      },
      image: logo,
      imageOptions: {
        imageSize: 0.8,
        crossOrigin: 'anonymous',
        margin: 20
      }
    };
    const qrCode = new QRCodeStyling(params);
    qrCode.append(qrCodeRef.value);
  } catch (error) {
    console.error('生成二维码失败:', error);
  }
};

// 下载二维码图片
const downloadQRCode = () => {
  if (!qrCodeData.value) return;

  const link = document.createElement('a');
  link.href = qrCodeData.value;
  link.download = 'qrcode.png';
  link.click();
};

// 组件挂载时初始化
onMounted(() => {
  // 可以设置默认值
  qrText.value = 'https://www.example.com';
});
</script>

<style scoped lang="less">
.qr-code-generator {
  padding: 20px;

  .input-section {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;

    .el-input {
      flex: 1;
    }
  }

  .qrcode-options,
  .qr-code-display {
    width: 50%;
    display: inline-block;
  }
  .qr-code-display {
    text-align: center;

    img {
      max-width: 300px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 10px;
    }
  }
}
</style>
