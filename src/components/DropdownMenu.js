import React from 'react';
import { DownloadOutlined, UploadOutlined, DeleteOutlined, MenuOutlined } from '@ant-design/icons';
import { Dropdown, Space } from 'antd';
import ConfigProvider from './ConfigProvider';

const items = [
  {
    label: 'Upload form data',
    key: '1',
    icon: <UploadOutlined />,
  },
  {
    label: 'Download form data as...',
    key: '2',
    icon: <DownloadOutlined />,
  },
  {
    label: 'Reset form',
    key: '3',
    icon: <DeleteOutlined />,
  },
];

const DropdownMenu = ({handleMenuSelection}) => {

  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 700) {
        setIsCollapsed(true)
      } else {
        setIsCollapsed(false)
      }
    }
    window.addEventListener('resize', handleResize)
  })

  const handleMenuClick = (item) => { 
    handleMenuSelection(items[item.key - 1].label) }
  
  const handleButtonClick = (e) => {
    handleMenuSelection('Download form data')
    };

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
  <Space wrap>
      <ConfigProvider componentSize={"large"}>
        <Dropdown.Button menu={menuProps} onClick={handleButtonClick} icon={<MenuOutlined />} title={'Download form data'}>
        { isCollapsed ? <DownloadOutlined /> : "Download form data" }
        </Dropdown.Button>
      </ConfigProvider>
  </Space>
  )
};

export default DropdownMenu;
