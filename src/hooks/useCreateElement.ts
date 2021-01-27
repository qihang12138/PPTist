import { computed } from 'vue'
import { useStore } from 'vuex'
import { MutationTypes, State } from '@/store'
import { createRandomCode } from '@/utils/common'
import { getImageSize } from '@/utils/image'
import { VIEWPORT_SIZE, VIEWPORT_ASPECT_RATIO } from '@/configs/canvas'
import { ChartType, PPTElement, TableCell } from '@/types/slides'
import { ShapePoolItem } from '@/configs/shapes'
import { LinePoolItem } from '@/configs/lines'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

interface CommonElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface LineElementPosition {
  top: number;
  left: number;
  start: [number, number];
  end: [number, number];
}

export default () => {
  const store = useStore<State>()
  const themeColor = computed(() => store.state.theme.themeColor)
  const fontColor = computed(() => store.state.theme.fontColor)

  const { addHistorySnapshot } = useHistorySnapshot()

  const createElement = (element: PPTElement) => {
    store.commit(MutationTypes.ADD_ELEMENT, element)
    store.commit(MutationTypes.SET_ACTIVE_ELEMENT_ID_LIST, [element.id])
    addHistorySnapshot()
  }

  const createImageElement = (src: string) => {
    getImageSize(src).then(({ width, height }) => {
      const scale = width / height
  
      if(scale < VIEWPORT_ASPECT_RATIO && width > VIEWPORT_SIZE) {
        width = VIEWPORT_SIZE
        height = width * scale
      }
      else if(height > VIEWPORT_SIZE * VIEWPORT_ASPECT_RATIO) {
        height = VIEWPORT_SIZE * VIEWPORT_ASPECT_RATIO
        width = height / scale
      }

      createElement({
        type: 'image',
        id: createRandomCode(),
        src,
        width,
        height,
        left: 0,
        top: 0,
        fixedRatio: true,
      })
    })
  }
  
  const createChartElement = (chartType: ChartType) => {
    createElement({
      type: 'chart',
      id: createRandomCode(),
      chartType,
      left: 300,
      top: 81.25,
      width: 400,
      height: 400,
      themeColor: themeColor.value,
      gridColor: fontColor.value,
      data: {
        labels: ['类别1', '类别2', '类别3', '类别4', '类别5'],
        series: [
          [12, 19, 5, 2, 18],
        ],
      },
    })
  }
  
  const createTableElement = (row: number, col: number) => {
    const rowCells: TableCell[] = new Array(col).fill({ id: createRandomCode(), colspan: 1, rowspan: 1, text: '' })
    const data: TableCell[][] = new Array(row).fill(rowCells)

    const DEFAULT_CELL_WIDTH = 100
    const DEFAULT_CELL_HEIGHT = 40

    const colWidths: number[] = new Array(col).fill(1 / col)

    createElement({
      type: 'table',
      id: createRandomCode(),
      width: col * DEFAULT_CELL_WIDTH,
      height: row * DEFAULT_CELL_HEIGHT,
      colWidths,
      data,
      left: 0,
      top: 0,
      outline: {
        width: 2,
        style: 'solid',
        color: '#eeece1',
      },
      theme: {
        color: themeColor.value,
        rowHeader: true,
        rowFooter: false,
        colHeader: false,
        colFooter: false,
      },
    })
  }
  
  const createTextElement = (position: CommonElementPosition) => {
    const { left, top, width, height } = position
    createElement({
      type: 'text',
      id: createRandomCode(),
      left, 
      top, 
      width, 
      height,
      content: '请输入内容',
    })
  }
  
  const createShapeElement = (position: CommonElementPosition, data: ShapePoolItem) => {
    const { left, top, width, height } = position
    createElement({
      type: 'shape',
      id: createRandomCode(),
      left, 
      top, 
      width, 
      height,
      viewBox: data.viewBox,
      path: data.path,
      fill: themeColor.value,
      fixedRatio: false,
    })
  }
  
  const createLineElement = (position: LineElementPosition, data: LinePoolItem) => {
    const { left, top, start, end } = position
    createElement({
      type: 'line',
      id: createRandomCode(),
      left, 
      top, 
      start,
      end,
      points: data.points,
      color: themeColor.value,
      style: 'solid',
      width: 2,
    })
  }

  return {
    createImageElement,
    createChartElement,
    createTableElement,
    createTextElement,
    createShapeElement,
    createLineElement,
  }
}