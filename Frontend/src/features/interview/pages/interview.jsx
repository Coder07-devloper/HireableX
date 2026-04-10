import React, { useEffect, useState } from 'react'
import '../style/interview.scss'
import { useParams } from 'react-router'
import { useInterview } from '../hooks/useInterview'

const BrandLogo = () => (
    <svg viewBox='0 0 48 48' aria-hidden='true'>
        <defs>
            <linearGradient id='hireablex-interview-gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                <stop offset='0%' stopColor='#ff7aa8' />
                <stop offset='100%' stopColor='#ff176f' />
            </linearGradient>
        </defs>
        <rect x='4' y='4' width='40' height='40' rx='14' fill='url(#hireablex-interview-gradient)' />
        <path d='M16 15h4v8h8v-8h4v18h-4v-6h-8v6h-4V15Z' fill='#ffffff' />
    </svg>
)

const EMPTY_REPORT = {
    matchScore: 0,
    technicalQuestions: [],
    behavioralQuestions: [],
    skillGaps: [],
    preparationPlan: [],
    title: '',
}

const NAV_ITEMS = [
    {
        id: 'technicalQuestions',
        label: 'Technical Questions',
        icon: (
            <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M8 8 4 12l4 4M16 8l4 4-4 4M14 5l-4 14' />
            </svg>
        ),
    },
    {
        id: 'behavioralQuestions',
        label: 'Behavioral Questions',
        icon: (
            <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='M6 5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-5 3V7a2 2 0 0 1 2-2Z' />
            </svg>
        ),
    },
    {
        id: 'preparationPlan',
        label: 'Road Map',
        icon: (
            <svg viewBox='0 0 24 24' aria-hidden='true'>
                <path d='m5 19 14-14M7 7h6v6M17 17h-6v-6' />
            </svg>
        ),
    },
]

const ChevronIcon = ({ open }) => (
    <svg className={open ? 'is-open' : ''} viewBox='0 0 24 24' aria-hidden='true'>
        <path d='m6 9 6 6 6-6' />
    </svg>
)

const QuestionItem = ({ item, index, isOpen, onToggle }) => (
    <article className={`question-item ${isOpen ? 'question-item--open' : ''}`}>
        <button type='button' className='question-item__trigger' onClick={onToggle}>
            <span className='question-item__badge'>Q{index + 1}</span>
            <span className='question-item__question'>{item.question}</span>
            <span className='question-item__chevron'>
                <ChevronIcon open={isOpen} />
            </span>
        </button>

        {isOpen && (
            <div className='question-item__body'>
                <div className='question-item__section'>
                    <p className='question-item__label'>Intention</p>
                    <p className='question-item__text'>{item.intention}</p>
                </div>
                <div className='question-item__section'>
                    <p className='question-item__label'>Model Answer</p>
                    <p className='question-item__text'>{item.answer}</p>
                </div>
            </div>
        )}
    </article>
)

const RoadMapItem = ({ item }) => (
    <article className='roadmap-item'>
        <div className='roadmap-item__header'>
            <span className='roadmap-item__day'>Day {item.day}</span>
            <h3 className='roadmap-item__title'>{item.focus}</h3>
        </div>
        <ul className='roadmap-item__tasks'>
            {item.tasks.map((task) => (
                <li key={task}>{task}</li>
            ))}
        </ul>
    </article>
)

const Interview = () => {
    const [ activeNav, setActiveNav ] = useState('behavioralQuestions')
    const [ openQuestion, setOpenQuestion ] = useState(0)
    const { intervieId } = useParams()
    const { loading, report, getReportById } = useInterview()
    const currentReport = report ?? EMPTY_REPORT

    useEffect(() => {
        if (intervieId && (!report || report._id !== intervieId)) {
            getReportById(intervieId).catch(() => {})
        }
    }, [intervieId])

    const activeItem = NAV_ITEMS.find((item) => item.id === activeNav)
    const activeQuestions = currentReport[activeNav] || []

    const renderMainContent = () => {
        if (activeNav === 'preparationPlan') {
            return (
                <div className='roadmap-list'>
                    {currentReport.preparationPlan.map((item) => (
                        <RoadMapItem key={item.day} item={item} />
                    ))}
                </div>
            )
        }

        return (
            <div className='question-list'>
                {activeQuestions.map((item, index) => (
                    <QuestionItem
                        key={item.question}
                        item={item}
                        index={index}
                        isOpen={openQuestion === index}
                        onToggle={() => setOpenQuestion(openQuestion === index ? -1 : index)}
                    />
                ))}
            </div>
        )
    }

    const scoreTone =
        currentReport.matchScore >= 80 ? 'score-card__ring--high' :
            currentReport.matchScore >= 60 ? 'score-card__ring--medium' :
                'score-card__ring--low'

    if (loading && !report) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        )
    }

    if (!report) {
        return (
            <main className='interview-page'>
                <div className='interview-page__frame'>
                    <div className='interview-brand'>
                        <span className='interview-brand__logo'>
                            <BrandLogo />
                        </span>
                        <span className='interview-brand__text'>HireableX</span>
                    </div>
                    <section className='interview-shell'>
                        <section className='interview-main'>
                            <header className='interview-main__header'>
                                <div className='interview-main__title-row'>
                                    <h1>Interview Report</h1>
                                </div>
                            </header>
                            <div className='interview-main__content'>
                                <div className='question-item question-item--open'>
                                    <div className='question-item__body'>
                                        <div className='question-item__section'>
                                            <p className='question-item__text'>No interview report data is available yet.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </section>
                </div>
            </main>
        )
    }

    return (
        <main className='interview-page'>
            <div className='interview-page__frame'>
                <div className='interview-brand'>
                    <span className='interview-brand__logo'>
                        <BrandLogo />
                    </span>
                    <span className='interview-brand__text'>HireableX</span>
                </div>
                <section className='interview-shell'>
                    <aside className='interview-nav'>
                        <p className='interview-nav__eyebrow'>Sections</p>
                        <div className='interview-nav__list'>
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    type='button'
                                    className={`interview-nav__item ${activeNav === item.id ? 'interview-nav__item--active' : ''}`}
                                    onClick={() => {
                                        setActiveNav(item.id)
                                        setOpenQuestion(0)
                                    }}
                                >
                                    <span className='interview-nav__icon'>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </aside>

                    <section className='interview-main'>
                        <header className='interview-main__header'>
                            <div className='interview-main__title-row'>
                                <h1>{activeItem?.label}</h1>
                                <span className='interview-main__count'>
                                    {activeNav === 'preparationPlan' ? `${currentReport.preparationPlan.length} days` : `${activeQuestions.length} questions`}
                                </span>
                            </div>
                        </header>

                        <div className='interview-main__content'>{renderMainContent()}</div>
                    </section>

                    <aside className='interview-sidebar'>
                        <section className='score-card'>
                            <p className='score-card__eyebrow'>Match Score</p>
                            <div className={`score-card__ring ${scoreTone}`}>
                                <span className='score-card__value'>{currentReport.matchScore}</span>
                                <span className='score-card__percent'>%</span>
                            </div>
                            <p className='score-card__caption'>Strong match for this role</p>
                        </section>

                        <section className='skill-panel'>
                            <p className='skill-panel__eyebrow'>Skill Gaps</p>
                            <div className='skill-panel__list'>
                                {currentReport.skillGaps.map((item) => (
                                    <span key={item.skill} className={`skill-pill skill-pill--${item.severity}`}>
                                        {item.skill}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </aside>
                </section>
            </div>
        </main>
    )
}

export default Interview
