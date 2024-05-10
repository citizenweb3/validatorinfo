import routes from 'router/routes'

const navigation = () => {
  return routes.reduce((prev: any, curr: any) => {
    const { meta, path, name, children } = curr
    if (meta?.icon) {
      prev.push({
        name,
        href: path,
        icon: meta.icon,
        color: meta.color,
        title: meta.title,
        requiresAuth: meta.requiresAuth,
        subOffset: meta.subOffset,
      })
    }
    children?.forEach((child: any) => {
      const { meta, path, name, children: childrenLevel3 } = child
      if(meta?.icon) {
        prev.push({
          name,
          href: path,
          icon: meta.icon,
          color: meta.color,
          title: meta.title,
          requiresAuth: meta.requiresAuth,
          subOffset: meta.subOffset,
        })
      }
      childrenLevel3?.forEach((childLevel3: any) => {
        const { meta, path, name } = childLevel3
        if(meta?.icon) {
          prev.push({
            name,
            href: path,
            icon: meta.icon,
            color: meta.color,
            title: meta.title,
            requiresAuth: meta.requiresAuth,
            subOffset: meta.subOffset,
          })
        }
      })
    })
    return prev
  }, [])
}

export default navigation()
