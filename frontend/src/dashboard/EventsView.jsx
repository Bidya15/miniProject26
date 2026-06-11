import React from 'react';
import EventsPanel from '../components/EventsPanel';
import s from './Alumni.module.css';
import evStyles from './EventsView.module.css';

const EventsView = () => {
    return (
        <div className={s.viewContainer}>
            <div className={evStyles.eventsGrid}>
                <div className={evStyles.column}>
                    <EventsPanel
                        category="UPCOMING"
                        title="Upcoming Events & Circulars"
                        isCompact={true}
                        isDashboard={true}
                    />
                </div>
                <div className={evStyles.column}>
                    <EventsPanel
                        category="REUNION"
                        title="Events & Reunions"
                        isCompact={true}
                        isDashboard={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default EventsView;
