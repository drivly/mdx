export interface DirectoryItem {
  id?: string | number
  name: string
  description?: string
  avatarUrl?: string
  [key: string]: unknown
}

interface DirectoryListProps {
  items?: DirectoryItem[]
  profiles?: DirectoryItem[]
  className?: string
  renderItem?: (item: DirectoryItem, index: number) => React.ReactNode
}

export const DirectoryList = ({ items, profiles, className, renderItem }: DirectoryListProps) => {
  const list = items || profiles || []

  return (
    <ul className={className}>
      {list.map((item, index) => (
        <li key={item.id ?? index} className='p-2'>
          {renderItem ? (
            renderItem(item, index)
          ) : (
            <div className='flex items-center gap-2'>
              {item.avatarUrl && (
                <img src={item.avatarUrl} alt={item.name} className='h-8 w-8 rounded-full object-cover' />
              )}
              <div>
                <div>{item.name}</div>
                {item.description && <div className='text-sm text-gray-500'>{item.description}</div>}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

