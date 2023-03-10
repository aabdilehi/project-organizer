import { useDragLayer } from 'react-dnd'

function DragLayerComponent(props) {
  const { item, itemType, currentOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
  }))

  // don't render anything if not dragging
  if (!currentOffset) {
    return null
  }

  // get x and y coordinates of current offset
  const { x, y } = currentOffset

  // render a box with a label at current offset position
  return (
    <div style={{ position: 'fixed', left: x, top: y }}>
      <div style={{ backgroundColor: 'white', border: '1px solid black' }}>
        {item.label}
      </div>
    </div>
  )
}

export default DragLayerComponent;
