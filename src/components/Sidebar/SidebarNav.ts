import routes from 'router/routes'

const navigation = () => {
  return routes.reduce((prev: any, curr: any) => {
    const { meta, path, name, children } = curr
    if (meta.icon) {
      prev.push({
        name,
        href: path,
        icon: meta.icon,
        color: meta.color,
        title: meta.title,
        children: children,
        requiresAuth: meta.requiresAuth,
        subOffset: meta.subOffset,
      })
    }
    return prev
  }, [])
}

export default navigation()
