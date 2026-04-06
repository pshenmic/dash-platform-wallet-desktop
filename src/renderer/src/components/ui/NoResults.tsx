import { Text } from "../dash-ui-kit-enxtended";

export default function NoResults({ noResults }: { noResults: string }): React.JSX.Element {
  return (
    <div className={"flex flex-col items-center justify-center py-12"}>
      <Text size={14} color={"default"} opacity={50}>
        {noResults}
      </Text>
    </div>
  )
}
