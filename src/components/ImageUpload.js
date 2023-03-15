import React, { useState } from 'react';
import { Modal, ConfigProvider, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

const ImageUpload = ({oldFileList, onImageUploadedFcn}) => {

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState(oldFileList);

  const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onImageUploadedFcn(newFileList);
  };

  // Callback when preview x-button is clicked
  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  // Note: Antd example which I couldnt get to work. Interesting that
  // it tries to use the file url (how to return this from backend) and
  // shows data if the url is empty.
  // const onPreview = async (file) => {
  //   let src = file.url;
  //   if (!src) {
  //     src = await new Promise((resolve) => {
  //       const reader = new FileReader();
  //       reader.readAsDataURL(file.originFileObj);
  //       reader.onload = () => resolve(reader.result);
  //     });
  //   }

  //   const image = new Image();
  //   image.src = src;
  //   const imgWindow = window.open(src);
  //   imgWindow?.document.write(image.outerHTML);
  // };

  const beforeUpload = (file) => {
    const isValidImageFormat = file.type === 'image/jpeg' || file.type === 'image/png'; // Todo: add gif
    if (!isValidImageFormat) {
      message.error('You can only upload a JPG/PNG/GIF file!');
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must smaller than 5MB!');
    }

    return isValidImageFormat && isLt5M;
  };

  const uploadButton = (
    <Button icon={<UploadOutlined />}>Upload</Button>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#45b07c',
        },
      }}
    >
      <div style={{"marginBottom":"30px"}}>
        <ImgCrop quality={1} grid>
          <Upload
            action='/api/upload/previewImage'
            accept=".png,.jpg,.gif"
            listType="picture"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={onChange}
            onPreview={handlePreview}
            className="upload-list-inline"
          >
            {fileList.length >= 1 ? null : uploadButton}
            {/* <Button icon={<UploadOutlined />}>Upload</Button> */}
          </Upload>
        </ImgCrop>
        <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
          <img
            alt="example"
            style={{
              width: '100%',
            }}
            src={previewImage}
          />
        </Modal>
      </div>
    </ConfigProvider>

  );
};
export default ImageUpload;