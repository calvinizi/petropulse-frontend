const StatusBadge = (props) => (
    <span className={`badge icon-badge${props.status}`}>{props.status}</span>   
)

export default StatusBadge