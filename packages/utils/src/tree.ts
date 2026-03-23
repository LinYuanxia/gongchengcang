export interface TreeNode {
  id: string | number
  parentId?: string | number | null
  children?: TreeNode[]
  [key: string]: any
}

export function arrayToTree<T extends TreeNode>(
  items: T[],
  parentId: string | number | null = null,
  parentKey: string = 'parentId'
): T[] {
  return items
    .filter(item => item[parentKey] === parentId)
    .map(item => ({
      ...item,
      children: arrayToTree(items, item.id, parentKey),
    }))
}

export function treeToArray<T extends TreeNode>(tree: T[], childrenKey: string = 'children'): T[] {
  const result: T[] = []
  const traverse = (nodes: T[]) => {
    nodes.forEach(node => {
      const { [childrenKey]: children, ...rest } = node as any
      result.push(rest as T)
      if (children && children.length) {
        traverse(children)
      }
    })
  }
  traverse(tree)
  return result
}

export function findTreeNode<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: string = 'children'
): T | null {
  for (const node of tree) {
    if (predicate(node)) {
      return node
    }
    const children = (node as any)[childrenKey]
    if (children && children.length) {
      const found = findTreeNode(children, predicate, childrenKey)
      if (found) return found
    }
  }
  return null
}

export function findTreePath<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: string = 'children'
): T[] {
  const path: T[] = []
  const traverse = (nodes: T[]): boolean => {
    for (const node of nodes) {
      path.push(node)
      if (predicate(node)) {
        return true
      }
      const children = (node as any)[childrenKey]
      if (children && children.length) {
        if (traverse(children)) {
          return true
        }
      }
      path.pop()
    }
    return false
  }
  traverse(tree)
  return path
}

export function forEachTree<T extends TreeNode>(
  tree: T[],
  callback: (node: T, level: number, parent: T | null) => void,
  childrenKey: string = 'children',
  level: number = 0,
  parent: T | null = null
): void {
  tree.forEach(node => {
    callback(node, level, parent)
    const children = (node as any)[childrenKey]
    if (children && children.length) {
      forEachTree(children, callback, childrenKey, level + 1, node)
    }
  })
}

export function filterTree<T extends TreeNode>(
  tree: T[],
  predicate: (node: T) => boolean,
  childrenKey: string = 'children'
): T[] {
  return tree
    .filter(predicate)
    .map(node => {
      const children = (node as any)[childrenKey]
      if (children && children.length) {
        return {
          ...node,
          [childrenKey]: filterTree(children, predicate, childrenKey),
        }
      }
      return node
    })
}
